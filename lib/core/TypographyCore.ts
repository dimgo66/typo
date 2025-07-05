import { TextProcessor } from "./TextProcessor";
import { HtmlProcessor } from "./HtmlProcessor";
import { TextProcessorRU } from "./TextProcessorRU";
import { TextProcessorEN } from "./TextProcessorEN";

export class TypographyCore {
  static typographText(text: string, lang: 'ru' | 'en' = 'ru'): string {
    if (!text || typeof text !== 'string') {
      throw new Error('Input must be a non-empty string');
    }

    const processor = lang === 'ru' ? new TextProcessorRU() : new TextProcessorEN();
    return processor.process(text);
  }

  static typographHtml(html: string, lang: 'ru' | 'en' = 'ru'): string {
    const processor = new HtmlProcessor(lang);
    return processor.process(html);
  }
}
