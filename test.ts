const { TextProcessorRU } = require('./lib/core/TextProcessorRU');

class TestableTextProcessorRU extends TextProcessorRU {
  public processTextPublic(text: string): string {
    return this.processText(text);
  }
}

const processor = new TestableTextProcessorRU();
const testCases = [
  "XXI век",
  "а я",
  "100 кг",
  "проект-долгожитель",
  "2020-2023"
];

testCases.forEach(text => {
  console.log(`Input: "${text}"`);
  console.log(`Output: "${processor.processTextPublic(text)}"`);
  console.log('---');
});
