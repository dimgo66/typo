import { TypographyCore } from '../lib/core/TypographyCore';

describe('TypographyCore', () => {
  describe('processRegularText', () => {
    it('should replace straight quotes with curly quotes for Russian', () => {
      const text = '"Вот пример"';
      const result = TypographyCore.typographText(text, 'ru');
      expect(result).toBe('«Вот пример»');
    });

    it('should replace straight quotes with curly quotes for English', () => {
      const text = '"This is an example"';
      const result = TypographyCore.typographText(text, 'en');
      expect(result).toBe('“This is an example”');
    });

    it('should replace hyphens with en-dashes', () => {
      const text = 'Москва - Санкт-Петербург';
      const result = TypographyCore.typographText(text, 'ru');
      expect(result).toBe('Москва – Санкт-Петербург');
    });

    it('should replace double hyphens with em-dashes', () => {
      const text = 'Москва--Санкт-Петербург';
      const result = TypographyCore.typographText(text, 'ru');
      expect(result).toBe('Москва—Санкт-Петербург');
    });

    it('should add non-breaking spaces for Russian', () => {
      const text = 'и т.д.';
      const result = TypographyCore.typographText(text, 'ru');
      expect(result).toBe('и т. д.');
    });

    it('should not add non-breaking spaces for English', () => {
      const text = 'etc.';
      const result = TypographyCore.typographText(text, 'en');
      expect(result).toBe('etc.');
    });
  });
});

describe('TypographyCore RU', () => {
  it('should replace straight quotes with curly quotes', () => {
    const text = '"Hello"';
    const result = TypographyCore.typographText(text, 'ru');
    expect(result).toBe('«Hello»');
  });

  it('should replace double hyphens with em dash', () => {
    const text = 'Hello -- world';
    const result = TypographyCore.typographText(text, 'ru');
    expect(result).toBe('Hello — world');
  });

  it('should replace single quotes with curly quotes', () => {
    const text = "'Hello'"
    const result = TypographyCore.typographText(text, 'ru');
    expect(result).toBe('‘Hello’');
  });

  it('should replace three dots with ellipsis', () => {
    const text = 'Hello...';
    const result = TypographyCore.typographText(text, 'ru');
    expect(result).toBe('Hello…');
  });

  it('should replace (c) with copyright symbol', () => {
    const text = '(c) 2023';
    const result = TypographyCore.typographText(text, 'ru');
    expect(result).toBe('© 2023');
  });

  it('should replace (r) with registered trademark symbol', () => {
    const text = '(r) Company';
    const result = TypographyCore.typographText(text, 'ru');
    expect(result).toBe('® Company');
  });
});
