import * as cheerio from 'cheerio';
import { TextProcessor } from "./TextProcessor";

interface ASTNode {
  type: 'element' | 'text';
  tagName?: string;
  attributes?: Record<string, string>;
  children?: ASTNode[];
  content?: string;
}

export class HtmlASTProcessor {
  private processor: TextProcessor;

  constructor(processor: TextProcessor) {
    this.processor = processor;
  }

  parse(html: string): ASTNode[] {
    const $ = cheerio.load(html);
    return $('body').children().toArray().map(element => this.parseElement(element));
  }

  private parseElement(element: cheerio.Element): ASTNode {
    if (element.type === 'text') {
      return {
        type: 'text',
        content: element.data || ''
      };
    }

    if (element.type === 'tag') {
      const node: ASTNode = {
        type: 'element',
        tagName: element.tagName,
        attributes: { ...element.attribs },
        children: []
      };

      if (element.children) {
        element.children.forEach(child => {
          const childNode = this.parseElement(child);
          if (childNode) {
            node.children!.push(childNode);
          }
        });
      }

      return node;
    }

    return { type: 'text', content: '' };
  }

  processNode(node: ASTNode, parentTag?: string): ASTNode | ASTNode[] {
    const skipProcessing = parentTag === 'pre' || parentTag === 'code';
    
    if (node.type === 'text' && node.content && !skipProcessing) {
      return {
        ...node,
        content: this.processor.process(node.content)
      };
    }
    
    if (node.children) {
      const newChildren: ASTNode[] = [];
      
      node.children.forEach(child => {
        const processedChild = this.processNode(child, node.tagName);
        
        if (Array.isArray(processedChild)) {
          newChildren.push(...processedChild);
        } else {
          newChildren.push(processedChild);
        }
      });
      
      const processedNode = { ...node, children: newChildren };
      
      // Добавляем нулевой пробел ПОСЛЕ тега, а не внутри
      if (node.tagName === 'strong' || node.tagName === 'em' || node.tagName === 'b') {
        return [processedNode, { type: 'text', content: '\u200B' }];
      }
      
      return processedNode;
    }
    
    return node;
  }

  private serializeNode(node: ASTNode): string {
    if (node.type === 'text') {
      return node.content || '';
    }

    const tagName = node.tagName || 'div';
    const attributes = node.attributes ? Object.entries(node.attributes)
      .map(([key, value]) => `${key}="${value}"`)
      .join(' ') : '';

    const children = node.children ? node.children.map(child => this.serializeNode(child)).join('') : '';

    return `<${tagName}${attributes ? ' ' + attributes : ''}>${children}</${tagName}>`;
  }

  serialize(nodes: ASTNode[]): string {
    return nodes.map(node => this.serializeNode(node)).join('');
  }

  process(html: string): string {
    const ast = this.parse(html);
    const processedAst: ASTNode[] = [];
    
    ast.forEach(node => {
      const result = this.processNode(node);
      
      if (Array.isArray(result)) {
        processedAst.push(...result);
      } else {
        processedAst.push(result);
      }
    });
    
    return this.serialize(processedAst);
  }
}
