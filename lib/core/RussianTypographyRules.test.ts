import { TextProcessorRU } from './TextProcessorRU';

describe('RussianTypographyRules', () => {
  let processor: TextProcessorRU;

  beforeEach(() => {
    processor = new TextProcessorRU();
  });

  describe('em-dash handling in dialogs', () => {
    it('should preserve em-dashes at the beginning of lines', () => {
      const input = `- Привет! Как дела?\n- Да нормально, спасибо.`;
      const result = processor.process(input);
      // The dashes should be converted to em-dashes
      expect(result).toContain('—');
      expect(result).not.toContain('--');
    });

    it('should handle em-dashes that might be disappearing', () => {
      const input = `— Привет! Как дела?\n— Да нормально, спасибо.`;
      const result = processor.process(input);
      // The em-dashes should be preserved
      expect(result).toContain('—');
    });

    it('should handle em-dashes in various contexts', () => {
      // Test with various whitespace contexts that might cause issues
      const input = `  - Привет! Как дела?\n\t- Да нормально, спасибо.\n    - А у тебя?`;
      const result = processor.process(input);
      // Check that we have em-dashes
      const emDashCount = (result.match(/—/g) || []).length;
      // Should have 3 em-dashes
      expect(emDashCount).toBe(3);
    });
  });

  describe('sentence duplication', () => {
    it('should not duplicate sentences', () => {
      const input = `Это первое предложение. Это второе предложение. Это второе предложение. Это третье предложение.`;
      const result = processor.process(input);
      const occurrences = (result.match(/Это второе предложение/g) || []).length;
      expect(occurrences).toBe(1); // Should only appear once
    });

    it('should handle paragraph-level deduplication', () => {
      const input = `Это первый абзац.

Это второй абзац.

Это второй абзац.`;
      const result = processor.process(input);
      const occurrences = (result.match(/Это второй абзац/g) || []).length;
      expect(occurrences).toBe(1); // Should only appear once
    });
  });
});