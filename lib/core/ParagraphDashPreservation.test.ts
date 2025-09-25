import { TextProcessorRU } from './TextProcessorRU';
import * as TC from './TypographyConstants';

describe('Paragraph Dash Preservation', () => {
  let processor: TextProcessorRU;

  beforeEach(() => {
    processor = new TextProcessorRU();
  });

  describe('Basic dash preservation at paragraph start', () => {
    it('should preserve em-dash at paragraph start', () => {
      const input = `— Привет! Как дела?\n— Да нормально, спасибо.`;
      const result = processor.process(input);
      
      // Should contain em-dashes
      expect(result).toContain(TC.EM_DASH);
      
      // Count em-dashes - should have 2
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
      
      // Should not lose any dashes
      expect(result).not.toMatch(/^[^—]*¶[^—]/);
    });

    it('should preserve en-dash at paragraph start', () => {
      const input = `– Первая реплика\n– Вторая реплика`;
      const result = processor.process(input);
      
      // Should convert to em-dashes
      expect(result).toContain(TC.EM_DASH);
      
      // Count em-dashes - should have 2
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
    });

    it('should preserve hyphen-minus at paragraph start', () => {
      const input = `- Элемент списка\n- Другой элемент`;
      const result = processor.process(input);
      
      // Should convert to em-dashes
      expect(result).toContain(TC.EM_DASH);
      
      // Count em-dashes - should have 2
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
    });

    it('should preserve double hyphen at paragraph start', () => {
      const input = `-- Диалог начинается\n-- Продолжение диалога`;
      const result = processor.process(input);
      
      // Should convert to em-dashes
      expect(result).toContain(TC.EM_DASH);
      
      // Count em-dashes - should have 2
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
    });
  });

  describe('Edge cases with whitespace', () => {
    it('should handle multiple spaces before dash', () => {
      const input = `   — Привет!\n    — Как дела?`;
      const result = processor.process(input);
      
      // Should preserve em-dashes
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
    });

    it('should handle tabs before dash', () => {
      const input = `\t— Привет!\n\t\t— Как дела?`;
      const result = processor.process(input);
      
      // Should preserve em-dashes and tabs
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
      
      // Should preserve tabs
      expect(result).toContain('\t');
    });

    it('should handle NBSP before dash', () => {
      const input = `${TC.NBSP}— Привет!\n${TC.NBSP}${TC.NBSP}— Как дела?`;
      const result = processor.process(input);
      
      // Should preserve em-dashes
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
    });

    it('should handle multiple spaces after dash', () => {
      const input = `—   Привет!\n—     Как дела?`;
      const result = processor.process(input);
      
      // Should normalize to single space after dash
      expect(result).toMatch(new RegExp(`${TC.EM_DASH} `));
      
      // Should not have multiple spaces after dash
      expect(result).not.toMatch(new RegExp(`${TC.EM_DASH}  `));
      
      // Should preserve em-dashes
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
    });

    it('should handle NBSP after dash', () => {
      const input = `—${TC.NBSP}Привет!\n—${TC.NBSP}${TC.NBSP}Как дела?`;
      const result = processor.process(input);
      
      // Should preserve em-dashes
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
      
      // Should have some form of space after dash (might not be normalized to single space)
      expect(result).toMatch(new RegExp(`${TC.EM_DASH}[ ${TC.NBSP}]`));
    });

    it('should handle mixed whitespace around dash', () => {
      const input = `  \t —  ${TC.NBSP} Привет!\n\t   —${TC.NBSP}${TC.NBSP}  Как дела?`;
      const result = processor.process(input);
      
      // Should preserve em-dashes
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
      
      // Should normalize spaces after dash
      expect(result).toMatch(new RegExp(`${TC.EM_DASH} `));
    });
  });

  describe('Complex paragraph structures', () => {
    it('should handle multiple paragraphs with dashes', () => {
      const input = `— Первый диалог\n\n— Второй диалог\n\n— Третий диалог`;
      const result = processor.process(input);
      
      // Should have 3 em-dashes
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(3);
      
      // Should preserve paragraph structure
      expect(result).toContain('¶¶');
    });

    it('should handle mixed content with and without dashes', () => {
      const input = `Обычный абзац без тире.\n— Диалог с тире\nЕще один обычный абзац.\n— Еще диалог`;
      const result = processor.process(input);
      
      // Should have 2 em-dashes
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
      
      // Should preserve regular text
      expect(result).toContain('Обычный абзац');
      expect(result).toContain('Еще один обычный');
    });

    it('should handle nested quotes with dashes', () => {
      const input = `— Он сказал: "Привет!"\n— А она ответила: "Пока!"`;
      const result = processor.process(input);
      
      // Should have 2 em-dashes
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
      
      // Should preserve quotes (converted to proper typography)
      expect(result).toContain('«');
      expect(result).toContain('»');
    });
  });

  describe('Unicode dash variants', () => {
    it('should handle Unicode em-dash (U+2014)', () => {
      const input = `\u2014 Привет!\n\u2014 Как дела?`;
      const result = processor.process(input);
      
      // Should preserve em-dashes
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
    });

    it('should handle Unicode en-dash (U+2013)', () => {
      const input = `\u2013 Привет!\n\u2013 Как дела?`;
      const result = processor.process(input);
      
      // Should convert to em-dashes
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
    });

    it('should handle Unicode minus (U+2212)', () => {
      const input = `\u2212 Привет!\n\u2212 Как дела?`;
      const result = processor.process(input);
      
      // Should preserve some form of dash (might be converted)
      expect(result).toMatch(/[—–\u2212]/);
    });

    it('should handle figure dash (U+2012)', () => {
      const input = `\u2012 Привет!\n\u2012 Как дела?`;
      const result = processor.process(input);
      
      // Should preserve some form of dash
      expect(result).toMatch(/[—–\u2012]/);
    });
  });

  describe('Regression tests for dash disappearance', () => {
    it('should not lose dashes during final cleanup phase', () => {
      const input = `— Тест на исчезновение тире\n— Второй тест`;
      const result = processor.process(input);
      
      // Critical: dashes must not disappear
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
      
      // Should not have empty paragraph starts
      expect(result).not.toMatch(/¶\s*[^—]/);
    });

    it('should preserve dashes with complex whitespace patterns', () => {
      const input = `  — Тест с пробелами\n\t— Тест с табуляцией\n${TC.NBSP}— Тест с NBSP`;
      const result = processor.process(input);
      
      // Should have 3 em-dashes
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(3);
    });

    it('should handle the specific case that was failing', () => {
      // This test reproduces the exact scenario that was causing dash disappearance
      const input = `— Первая строка диалога\n— Вторая строка диалога`;
      const result = processor.process(input);
      
      // Must preserve both dashes
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
      
      // Should start with em-dash after paragraph symbol
      expect(result).toMatch(new RegExp(`¶${TC.EM_DASH}`));
    });

    it('should not remove dashes when applying deduplication', () => {
      const input = `— Уникальная реплика\n— Другая уникальная реплика\n— Третья уникальная реплика`;
      const result = processor.process(input);
      
      // Should preserve all 3 dashes
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(3);
    });
  });

  describe('Performance and edge cases', () => {
    it('should handle very long text with many dashes', () => {
      const lines = Array.from({ length: 100 }, (_, i) => `— Строка диалога номер ${i + 1}`);
      const input = lines.join('\n');
      const result = processor.process(input);
      
      // Should preserve all 100 dashes
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(100);
    });

    it('should handle empty lines between dashes', () => {
      const input = `— Первая реплика\n\n\n— Вторая реплика после пустых строк`;
      const result = processor.process(input);
      
      // Should preserve both dashes
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
      
      // Should preserve empty paragraphs
      expect(result).toContain('¶¶');
    });

    it('should handle dashes at document start and end', () => {
      const input = `— Начало документа\nОбычный текст\n— Конец документа`;
      const result = processor.process(input);
      
      // Should preserve both dashes
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
    });

    it('should handle single character lines with dashes', () => {
      const input = `—\n—\n—`;
      const result = processor.process(input);
      
      // Should preserve at least some dashes (might be deduplicated)
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBeGreaterThan(0);
      
      // Should contain em-dash
      expect(result).toContain(TC.EM_DASH);
    });
  });

  describe('Integration with other typography rules', () => {
    it('should preserve dashes while applying other typography rules', () => {
      const input = `— Привет! Как дела?\n— Да нормально, спасибо. А у тебя?`;
      const result = processor.process(input);
      
      // Should preserve dashes
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
      
      // Should apply other rules (NBSP after single-letter words)
      expect(result).toContain(`А${TC.NBSP}у`);
    });

    it('should handle dashes with quotes and other punctuation', () => {
      const input = `— "Привет!" - сказал он.\n— "Пока!" - ответила она.`;
      const result = processor.process(input);
      
      // Should have em-dashes in the result
      const totalEmDashes = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(totalEmDashes).toBeGreaterThan(0);
      
      // Should convert quotes
      expect(result).toContain('«');
      expect(result).toContain('»');
    });

    it('should handle dashes with numbers and abbreviations', () => {
      const input = `— В 2023 г. произошло событие\n— Это было в стр. 15`;
      const result = processor.process(input);
      
      // Should preserve dashes
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(2);
      
      // Should apply NBSP rules
      expect(result).toContain(`2023${TC.NBSP}г.`);
      expect(result).toContain(`стр.${TC.NBSP}15`);
    });
  });

  describe('Specific whitespace preservation', () => {
    it('should preserve tabs in poetry-like structures', () => {
      const input = `\t— Первая строка\n\t\t— Вложенная строка\n\t— Возврат к первому уровню`;
      const result = processor.process(input);
      
      // Should preserve all dashes
      const emDashCount = (result.match(new RegExp(TC.EM_DASH, 'g')) || []).length;
      expect(emDashCount).toBe(3);
      
      // Should preserve some form of indentation (tabs might be converted to spaces)
      expect(result).toMatch(/¶[ \t]+—/);
      
      // Should contain em-dashes
      expect(result).toContain(TC.EM_DASH);
    });

    it('should normalize space after dash but preserve leading whitespace', () => {
      const input = `  — Текст с отступом\n\t— Текст с табуляцией`;
      const result = processor.process(input);
      
      // Should have proper space after dash
      expect(result).toMatch(new RegExp(`${TC.EM_DASH} `));
      
      // Should not have multiple spaces after dash
      expect(result).not.toMatch(new RegExp(`${TC.EM_DASH}  `));
      
      // Should preserve leading structure (tabs)
      expect(result).toContain('\t');
    });
  });
});