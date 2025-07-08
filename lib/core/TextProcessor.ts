import { LRUCache } from 'lru-cache';

export abstract class TextProcessor {
  private cache: LRUCache<string, string>;

  constructor() {
    this.cache = new LRUCache<string, string>({ max: 1000 });
  }

  process(text: string): string {
    const cached = this.cache.get(text);
    if (cached !== undefined) {
      return cached;
    }

    const processed = this.processText(text);
    this.cache.set(text, processed);
    return processed;
  }

  public processText(text: string): string {
    return text;
  }
}
