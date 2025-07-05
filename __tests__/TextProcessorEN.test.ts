import { TextProcessorEN } from '../lib/core/TextProcessorEN';

describe('TextProcessorEN', () => {
  it('should replace double quotes', () => {
    const processor = new TextProcessorEN();
    const input = 'This is a "test"';
    const expected = 'This is a “test”';
    expect(processor.process(input)).toBe(expected);
  });
});
