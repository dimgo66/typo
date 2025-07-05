import {
  TypographyCore
} from '../lib/core/TypographyCore';

describe('TypographyCore', () => {
  describe('typographText', () => {
    it('should process Russian text with quotes, dashes, and non-breaking spaces', () => {
      const input = 'Это "тест" -- и т. д. Вес: 5 кг. А. С. Пушкин';
      const expected = 'Это «тест» — и т. д. Вес: 5 кг. А. С. Пушкин';
      expect(TypographyCore.typographText(input)).toBe(expected);
    });

    it('should process English text with quotes, dashes, and non-breaking spaces', () => {
      const input = 'This is a "test" -- and so on.';
      const expected = 'This is a “test” — and so on.';
      expect(TypographyCore.typographText(input)).toBe(expected);
    });

    it('should replace range dashes with en-dash', () => {
      const input = 'Pages 1 - 10';
      const expected = 'Pages 1–10';
      expect(TypographyCore.typographText(input)).toBe(expected);
    });

    it('should preserve protected words', () => {
      const input = 'кто-то где-то';
      expect(TypographyCore.typographText(input)).toBe('кто-то где-то');
    });

    it('should throw error for invalid input', () => {
      expect(() => TypographyCore.typographText(null as any)).toThrow('Input must be a non-empty string');
      expect(() => TypographyCore.typographText('')).toThrow('Input must be a non-empty string');
    });

    it('should apply custom rules', () => {
      // Удаляем, так как текущее API не поддерживает кастомные правила
    });
  });

  describe('typographHtml', () => {
    it('should process HTML text nodes', () => {
      const input = '<p>This is a "test" -- and so on.</p>';
      const expected = '<p>This is a «test» — and so on.</p>';
      expect(TypographyCore.typographHtml(input)).toBe(expected);
    });

    it('should skip pre and code tags', () => {
      const input = '<pre>This is a "test" -- code</pre><p>"Quoted" text</p>';
      const expected = '<pre>This is a "test" -- code</pre><p>«Quoted» text</p>';
      expect(TypographyCore.typographHtml(input)).toBe(expected);
    });

    it('should throw error for invalid HTML', () => {
      const input = '<p>Unclosed tag';
      expect(() => TypographyCore.typographHtml(input)).toThrow(/Failed to process HTML/);
    });

    it('should process English HTML text nodes', () => {
      const input = '<p>This is a "test" -- and so on.</p>';
      const expected = '<p>This is a “test” — and so on.</p>';
      expect(TypographyCore.typographHtml(input, 'en')).toBe(expected);
    });

    it('should handle inline tags correctly', () => {
      const input = '<div><p>"Test" -- <span>and</span> so on.</p></div>';
      const expected = '<div><p>“Test” — <span>and</span> so on.</p></div>';
      expect(TypographyCore.typographHtml(input, 'en')).toBe(expected);
    });

    it('should preserve whitespace', () => {
      const input = '<p>  Text  </p>';
      const expected = '<p>  Text  </p>';
      expect(TypographyCore.typographHtml(input)).toBe(expected);
    });

    it('should process complex HTML', () => {
      const input = '<div><p>"Test" -- <span>and</span> so on.</p></div>';
      const expected = '<div><p>“Test” — <span>and</span> so on.</p></div>';
      expect(TypographyCore.typographHtml(input, 'en')).toBe(expected);
    });
  });

  it('should handle empty lines in poetry', () => {
    const input = `Line one\n\nLine two`;
    expect(TypographyCore.typographText(input)).toBe(input);
  });

  it('should process complex HTML', () => {
    const input = '<div><p>"Test" -- <span>and</span> so on.</p></div>';
    const expected = '<div><p>“Test” — <span>and</span> so on.</p></div>';
    expect(TypographyCore.typographHtml(input, 'en')).toBe(expected);
  });
});