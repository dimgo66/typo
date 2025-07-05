export const NON_BREAKING_SPACE = '\u00A0';
export const EM_DASH = '\u2014';
export const EN_DASH = '\u2013';

export const LANGUAGE_CONFIGS = {
  ru: {
    quotes: [['«', '»'], ['„', '“']],
    dash: EM_DASH,
    nbsp: NON_BREAKING_SPACE,
  },
  en: {
    quotes: [['“', '”'], ['‘', '’']],
    dash: EN_DASH,
    nbsp: NON_BREAKING_SPACE,
  },
};
