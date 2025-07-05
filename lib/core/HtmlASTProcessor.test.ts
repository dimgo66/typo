import { HtmlASTProcessor } from './HtmlASTProcessor';
import { TextProcessor } from './TextProcessor';
import { TextProcessorRU } from './TextProcessorRU';

class MockTextProcessor extends TextProcessor {
  protected processText(text: string): string {
    return text.toUpperCase();
  }
}

describe('HtmlASTProcessor', () => {
  let processor: HtmlASTProcessor;

  beforeEach(() => {
    processor = new HtmlASTProcessor(new MockTextProcessor());
  });

  it('should parse simple HTML', () => {
    const html = '<div>Test</div>';
    const ast = processor.parse(html);
    expect(ast).toEqual([
      {
        type: 'element',
        tagName: 'div',
        attributes: {},
        children: [
          { type: 'text', content: 'Test' }
        ]
      }
    ]);
  });

  it('should process text nodes', () => {
    const html = '<p>Hello</p>';
    const result = processor.process(html);
    expect(result).toBe('<p>HELLO</p>');
  });

  it('should ignore pre and code tags', () => {
    const html = '<pre>Code</pre><p>Text</p><code>More code</code>';
    const result = processor.process(html);
    expect(result).toBe('<pre>Code</pre><p>TEXT</p><code>More code</code>');
  });

  it('should serialize attributes', () => {
    const html = '<a href="https://example.com">Link</a>';
    const result = processor.process(html);
    expect(result).toBe('<a href="https://example.com">LINK</a>');
  });

  it('должен добавлять неразрывные пробелы в тексте', () => {
    const processor = new HtmlASTProcessor(new TextProcessorRU());
    const html = '<p>Это т.д. и т.п.</p>';
    const expected = '<p>Это т. д. и т. п.</p>';
    expect(processor.process(html)).toEqual(expected);
  });
  
  it('должен заменять дефисы на тире', () => {
    const processor = new HtmlASTProcessor(new TextProcessorRU());
    const html = '<p>Это тест - проверка</p>';
    const expected = '<p>Это тест — проверка</p>';
    expect(processor.process(html)).toEqual(expected);
  });
  
  it('должен сбрасывать жирное начертание после закрытия тега', () => {
    const processor = new HtmlASTProcessor(new TextProcessorRU());
    const html = '<p><strong>Жирный текст</strong> и обычный</p>';
    const expected = '<p><strong>Жирный текст</strong>\u200B и обычный</p>';
    expect(processor.process(html)).toEqual(expected);
  });
});
