import { NextApiRequest, NextApiResponse } from 'next';
import { TextProcessorRU } from '../../lib/core/TextProcessorRU';

class TestableTextProcessorRU extends TextProcessorRU {
  public processTextPublic(text: string): string {
    return this.processText(text);
  }
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { text } = req.body;
  const processor = new TestableTextProcessorRU();
  
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  const result = processor.processTextPublic(text);
  res.status(200).json({ result });
}
