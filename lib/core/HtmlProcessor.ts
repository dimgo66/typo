import { TextProcessor } from "./TextProcessor";
import { TextProcessorEN } from "./TextProcessorEN";
import { TextProcessorRU } from "./TextProcessorRU";
import { HtmlASTProcessor } from './HtmlASTProcessor';

export class HtmlProcessor {
  private processor: TextProcessor;
  private astProcessor: HtmlASTProcessor;

  constructor(language: string) {
    if (language === 'ru') {
      this.processor = new TextProcessorRU();
    } else if (language === 'en') {
      this.processor = new TextProcessorEN();
    } else {
      throw new Error(`Unsupported language: ${language}`);
    }
    this.astProcessor = new HtmlASTProcessor(this.processor, language);
  }

  process(html: string): string {
    return this.astProcessor.process(html);
  }
}
