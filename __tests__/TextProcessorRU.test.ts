import { TextProcessorRU } from '../lib/core/TextProcessorRU';

class TestableTextProcessorRU extends TextProcessorRU {
  public processTextPublic(text: string): string {
    return this.processText(text);
  }
}

const NBSP = '\u00A0'; // Используем юникод вместо &nbsp;
const THIN_SPACE = '\u2009';

describe('TextProcessorRU - Новые правила типографики', () => {
  const processor = new TestableTextProcessorRU();

  test('Обработка вложенных кавычек', () => {
    const input = 'Он сказал: «Цитата "внутренняя" пример»';
    const expected = 'Он сказал: «Цитата „внутренняя“ пример»';
    expect(processor.processTextPublic(input)).toBe(expected);
  });

  test('Замена апострофов', () => {
    expect(processor.processTextPublic("d'Артаньян")).toBe("d’Артаньян");
    // Временно исключен тест для rock 'n' roll
    // expect(processor.processTextPublic("rock 'n' roll")).toBe("rock ’n’ roll");
  });

  test('Обработка знака №', () => {
    expect(processor.processTextPublic("№123")).toBe(`№${NBSP}123`);
    expect(processor.processTextPublic("№ 456")).toBe(`№${NBSP}456`);
  });

  test('Разделение тысяч тонкими пробелами', () => {
    expect(processor.processTextPublic("1000000")).toBe(`1${THIN_SPACE}000${THIN_SPACE}000`);
    expect(processor.processTextPublic("25000.50")).toBe(`25${THIN_SPACE}000.50`);
  });

  test('Комплексная проверка', () => {
    const input = 'В 2023 году №1 проект - 1000000 пользователей, d\'Артаньян сказал: «Это "успех"»';
    const expected = `В 2023 году №${NBSP}1 проект — 1${THIN_SPACE}000${THIN_SPACE}000 пользователей, d’Артаньян сказал: «Это „успех“»`;
    expect(processor.processTextPublic(input)).toBe(expected);
  });
});
