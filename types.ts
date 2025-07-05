export interface ProcessingOptions {
  language?: string;
  enableQuotes?: boolean;
  enableDashes?: boolean;
  enableNbsp?: boolean;
  customRules?: TypographyRule[];
}

export interface TypographyRule {
  pattern: RegExp;
  replacement: string;
  enabled?: (options: ProcessingOptions) => boolean;
}
