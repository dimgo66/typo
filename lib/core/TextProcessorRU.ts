import { TextProcessor } from './TextProcessor';
import { applySortedRules, RUSSIAN_TYPOGRAPHY_RULES } from './RussianTypographyRules';

export class TextProcessorRU extends TextProcessor {
  public processText(text: string): string {
    return applySortedRules(text, RUSSIAN_TYPOGRAPHY_RULES);
  }
}
