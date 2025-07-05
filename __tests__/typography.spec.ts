import { TypographyCore } from '../lib/core/TypographyCore';

const U2029 = '\u2029';
const NBSP = '\u00A0';

describe('Typography processor', () => {
  it('keeps bold formatting and inserts paragraph symbol', () => {
    const input = '<strong>Bold</strong>\nplain';
    const expected = `<strong>Bold</strong>${U2029}plain`;
    expect(TypographyCore.typographHtml(input)).toBe(expected);
  });

  it('preserves inline italic inside paragraph', () => {
    const input = 'Text <em>italic</em> word';
    const expected = 'Text <em>italic</em> word';
    expect(TypographyCore.typographHtml(input)).toBe(expected);
  });

  it('handles double newlines as a single paragraph break', () => {
    const input = 'First line\n\nSecond line';
    const expected = `First line${U2029}Second line`;
    expect(TypographyCore.typographHtml(input)).toBe(expected);
  });

  it('breaks formatting tags across paragraph breaks', () => {
    const input = '<em>First part of italic text\nand this part is also italic</em>';
    const expected = `<em>First part of italic text</em>${U2029}<em>and this part is also italic</em>`;
    expect(TypographyCore.typographHtml(input)).toBe(expected);
  });

  it('preserves quotes and non-breaking spaces after breaking tags', () => {
    const input = '<em>"В кавычках" и\na не в кавычках</em>';
    const expected = `<em>«В кавычках»${NBSP}и</em>${U2029}<em>а не${NBSP}в${NBSP}кавычках</em>`;
    expect(TypographyCore.typographHtml(input)).toBe(expected);
  });
});
