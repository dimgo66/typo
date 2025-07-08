import * as TC from './TypographyConstants';

export interface TypographyRule {
  name: string;
  priority: number;
  pattern: RegExp;
  replacement: string | ((match: string, ...groups: string[]) => string);
  description: string;
}

export const RUSSIAN_TYPOGRAPHY_RULES: TypographyRule[] = [
  // Приоритет -2.2: Удаление пробелов в начале строки (но сохраняем табуляции)
  {
    name: 'remove_leading_spaces_keep_tabs',
    priority: -2.2,
    pattern: /^(\t*)[ \u2009]+/gm,
    replacement: '$1',
    description: 'Удаление пробелов в начале строки после табуляций (сохраняем табуляции для поэзии, не трогаем NBSP)'
  },

  // Приоритет -2.1: Удаление обычных пробелов в начале строки (но не NBSP)
  {
    name: 'remove_leading_spaces_no_tabs',
    priority: -2.1,
    pattern: /^[ \u2009]+/gm,
    replacement: '',
    description: 'Удаление обычных пробелов в начале строки (обычные пробелы и тонкие пробелы, но не NBSP)'
  },

  // Приоритет -1: Удаление пробелов после символа абзаца
  {
    name: 'remove_spaces_after_paragraph_symbol',
    priority: -1,
    pattern: /¶[ \t\u00A0\u2009]+/g,
    replacement: '¶',
    description: 'Удаление пробелов после символа абзаца (¶)'
  },

  // Приоритет 1: Базовая очистка
  {
    name: 'multiple_spaces',
    priority: 1,
    pattern: /(?<!^)[ \t]{2,}/gm,
    replacement: ' ',
    description: 'Удаление многократных пробелов (но не переносов строк и не в начале строки)'
  },

  // Приоритет 1.9: Замена короткого тире на длинное в конце строфы
  {
    name: 'en_dash_to_em_dash_at_line_end',
    priority: 1.9,
    pattern: /–(\s*)(?=\n|\r|$)/gm,
    replacement: `${TC.EM_DASH}$1`,
    description: 'Замена короткого тире на длинное в конце строфы'
  },

  // Приоритет 1.93: Замена дефиса на длинное тире в начале строки, если нет пробела после него
  {
    name: 'dash_to_em_dash_no_space',
    priority: 1.93,
    pattern: /^(\s*)-(?!\s)/gm,
    replacement: `$1${TC.EM_DASH} `,
    description: 'Замена дефиса на длинное тире и добавление пробела в начале строки'
  },

  // Приоритет 1.94: Замена обычного дефиса на эм-тире в начале строки в диалогах
  {
    name: 'dash_to_em_dash_at_line_start',
    priority: 1.94,
    pattern: /^(\s*)-\s/gm,
    replacement: `$1${TC.EM_DASH} `,
    description: 'Замена обычного дефиса на эм-тире в начале строки в диалогах'
  },

  // Приоритет 1.95: Замена короткого дефиса на эм-тире в начале строки в диалогах
  {
    name: 'hyphen_to_em_dash_at_line_start',
    priority: 1.95,
    pattern: /^(\s*)–\s/gm,
    replacement: `$1${TC.EM_DASH} `,
    description: 'Замена короткого дефиса на эм-тире в начале строки в диалогах'
  },

  // Приоритет 2: Предварительная замена тире (до обработки пробелов)
  {
    name: 'dash_to_em_dash',
    priority: 2,
    pattern: /(\S)\s+-\s+(\S)/g,
    replacement: (match: string, before: string, after: string) => {
      // Не заменяем, если это диапазон чисел, дат или римских цифр
      if (/\d$/.test(before) && /^\d/.test(after)) return match;
      if (/^[IVXLCDM]+$/.test(before) && /^[IVXLCDM]+/.test(after)) return match;
      if (/\d{4}$/.test(before) && /^\d{4}/.test(after)) return match;
      
      return `${before}${TC.NBSP}${TC.EM_DASH} ${after}`;
    },
    description: 'Замена дефиса на длинное тире в предложениях'
  },

  // Приоритет 2.5: Замена коротких тире на длинные (кроме числовых диапазонов)
  {
    name: 'en_dash_to_em_dash',
    priority: 2.5,
    pattern: /(\S)[ \t]*–[ \t]*(\S)/g,
    replacement: (match: string, before: string, after: string) => {
      // Не заменяем, если это диапазон чисел, дат или римских цифр
      if (/\d$/.test(before) && /^\d/.test(after)) return match;
      if (/^[IVXLCDM]+$/.test(before) && /^[IVXLCDM]+/.test(after)) return match;
      if (/\d{4}$/.test(before) && /^\d{4}/.test(after)) return match;
      
      return `${before}${TC.NBSP}${TC.EM_DASH} ${after}`;
    },
    description: 'Замена короткого тире на длинное (кроме числовых диапазонов)'
  },

  // Приоритет 3: Обработка числовых диапазонов
  {
    name: 'numeric_ranges',
    priority: 3,
    pattern: /(\d+)\s*[-–]\s*(\d+)/g,
    replacement: `$1${TC.EN_DASH}$2`,
    description: 'Короткое тире в числовых диапазонах'
  },

  // Приоритет 1.1: Диапазоны дат/годов (ранний приоритет)
  // Примеры: "1592-1593" → "1592–1593", "2020 - 2023" → "2020–2023"
  {
    name: 'date_ranges',
    priority: 1.1,
    pattern: /(\b(?:1[0-9]{3}|20[0-9]{2}))\s*[-–]\s*((?:1[0-9]{3}|20[0-9]{2})\b)/g,
    replacement: `$1${TC.EN_DASH}$2`,
    description: 'Короткое тире без пробелов в диапазонах дат и годов'
  },

  // Приоритет 1.2: Римские цифры в диапазонах (ранний приоритет)
  // Примеры: "XIII-XIV" → "XIII–XIV", "I - V" → "I–V"
  {
    name: 'roman_ranges',
    priority: 1.2,
    pattern: /(\b[IVXLCDM]+)\s*[-–]\s*([IVXLCDM]+\b)/g,
    replacement: `$1${TC.EN_DASH}$2`,
    description: 'Короткое тире без пробелов в диапазонах римских цифр'
  },

  // Приоритет 4: Неразрывные дефисы в составных словах
  {
    name: 'non_breaking_hyphens',
    priority: 4,
    pattern: /([а-яё])-([а-яё])/gi,
    replacement: `$1${TC.NON_BREAKING_HYPHEN}$2`,
    description: 'Неразрывные дефисы в составных словах'
  },

  // Приоритет 5: Однобуквенные предлоги (отдельные правила)
  {
    name: 'preposition_v',
    priority: 5,
    pattern: /(^|\s)в /gi,
    replacement: (match: string, prefix: string) => `${prefix}${match.trim()}${TC.NBSP}`,
    description: 'Неразрывный пробел после "в"'
  },
  {
    name: 'preposition_k',
    priority: 5,
    pattern: /(^|\s)к /gi,
    replacement: (match: string, prefix: string) => `${prefix}${match.trim()}${TC.NBSP}`,
    description: 'Неразрывный пробел после "к"'
  },
  {
    name: 'preposition_s',
    priority: 5,
    pattern: /(^|\s)с /gi,
    replacement: (match: string, prefix: string) => `${prefix}${match.trim()}${TC.NBSP}`,
    description: 'Неразрывный пробел после "с"'
  },
  {
    name: 'preposition_u',
    priority: 5,
    pattern: /(^|\s)у /gi,
    replacement: (match: string, prefix: string) => `${prefix}${match.trim()}${TC.NBSP}`,
    description: 'Неразрывный пробел после "у"'
  },
  {
    name: 'preposition_o',
    priority: 5,
    pattern: /(^|\s)о /gi,
    replacement: (match: string, prefix: string) => `${prefix}${match.trim()}${TC.NBSP}`,
    description: 'Неразрывный пробел после "о"'
  },
  {
    name: 'preposition_ya',
    priority: 5,
    pattern: /(^|\s)я /gi,
    replacement: (match: string, prefix: string) => `${prefix}${match.trim()}${TC.NBSP}`,
    description: 'Неразрывный пробел после "я"'
  },
  {
    name: 'conjunction_i',
    priority: 5,
    pattern: /(^|\s)и /gi,
    replacement: (match: string, prefix: string) => `${prefix}${match.trim()}${TC.NBSP}`,
    description: 'Неразрывный пробел после "и"'
  },
  {
    name: 'conjunction_a',
    priority: 5,
    pattern: /(^|\s)а /gi,
    replacement: (match: string, prefix: string) => `${prefix}${match.trim()}${TC.NBSP}`,
    description: 'Неразрывный пробел после "а"'
  },

  // Приоритет 5.5: Двухбуквенные предлоги
  {
    name: 'two_letter_prepositions',
    priority: 5.5,
    pattern: /(^|\s)(на|по|за|из|от|до|во|со|ко|об|ну) /gi,
    replacement: (match: string, prefix: string, prep: string) => `${prefix}${prep}${TC.NBSP}`,
    description: 'Неразрывные пробелы после двухбуквенных предлогов'
  },

  // Приоритет 6: Двухбуквенные частицы и предлоги
  {
    name: 'two_letter_particles',
    priority: 6,
    pattern: /\b(не|ни|да|но|та|ту|то|те|см|им|др|пр|тд|тп)\.\s+/gi,
    replacement: `$1.${TC.NBSP}`,
    description: 'Неразрывные пробелы после двухбуквенных сокращений'
  },

  // Приоритет 7: Обработка "и т.д.", "и т.п."
  {
    name: 'and_so_on',
    priority: 7,
    pattern: /\bи\s+т\.\s*([дп])\./g,
    replacement: `и${TC.NBSP}т.${TC.NBSP}$1.`,
    description: 'Неразрывные пробелы в "и т.д.", "и т.п."'
  },

  // Приоритет 8: Знак номера
  {
    name: 'numero_sign',
    priority: 8,
    pattern: /(^|\s)№\s*(\d)/g,
    replacement: `$1${TC.NUMERO_SIGN}${TC.NBSP}$2`,
    description: 'Неразрывный пробел после знака номера'
  },

  // Приоритет 9.7: Универсальное правило - неразрывный пробел между числом и словом
  {
    name: 'number_word_nbsp',
    priority: 9.7,
    pattern: /(\d+)\s+([а-яёА-ЯЁ]+)/gu,
    replacement: `$1${TC.NBSP}$2`,
    description: 'Неразрывный пробел между числом и любым словом'
  },
  
  // Приоритет 9.71: Неразрывные дефисы в датах с окончаниями
  {
    name: 'dates_with_endings',
    priority: 9.71,
    pattern: /(\d{2,4})-(е|х|м|я|й|ю|и|ы)(?![а-яёА-ЯЁ])/g,
    replacement: `$1${TC.NON_BREAKING_HYPHEN}$2`,
    description: 'Неразрывные дефисы в датах с окончаниями (1990-е, 80-х)'
  },

  // Приоритет 9.75: Неразрывный пробел после заглавных двухбуквенных предлогов
  {
    name: 'capital_two_letter_prepositions',
    priority: 9.75,
    pattern: /(^|\s)(На|По|За|Из|От|До|Во|Со|Ко|Об|Ну)\s/g,
    replacement: `$1$2${TC.NBSP}`,
    description: 'Неразрывный пробел после заглавных двухбуквенных предлогов'
  },

  // Приоритет 9.8: Неразрывный пробел после заглавных предлогов (А, В, К, С, У, О, И, Я)
  {
    name: 'capital_prepositions',
    priority: 9.8,
    pattern: /(^|\s)([АВКСУОИЯ])\s/g,
    replacement: `$1$2${TC.NBSP}`,
    description: 'Неразрывный пробел после заглавных предлогов'
  },

  // Приоритет 9.9: Неразрывный пробел после предлогов с запятой (И,)
  {
    name: 'preposition_with_comma',
    priority: 9.9,
    pattern: /(^|\s)([И]),\s/g,
    replacement: `$1$2,${TC.NBSP}`,
    description: 'Неразрывный пробел после предлогов с запятой'
  },

  // Приоритет 10: Тонкие пробелы в больших числах (только для чисел от 5 цифр)
  {
    name: 'thin_spaces_in_numbers',
    priority: 10,
    pattern: /\b(\d{5,})\b/g,
    replacement: (match: string) => {
      return match.replace(/(\d)(?=(\d{3})+$)/g, `$1${TC.THIN_SPACE}`);
    },
    description: 'Тонкие пробелы в больших числах (5+ цифр)'
  },

  // Приоритет 9.3: Комплексное правило для всех случаев инициалов с фамилией
  {
    name: 'comprehensive_initials',
    priority: 9.3,
    pattern: /(^|[\s\u00A0])([А-ЯЁ]\.)\s*([А-ЯЁ]\.)\s*([А-ЯЁ][а-яё]+)/g,
    replacement: `$1$2${TC.NBSP}$3${TC.NBSP}$4`,
    description: 'Неразрывные пробелы в полных последовательностях инициалов с фамилией'
  },
  
  // Приоритет 9.4: Инициалы (два инициала + фамилия с пробелами)
  {
    name: 'initials',
    priority: 9.4,
    pattern: /(\b[А-ЯЁ])\.\s+([А-ЯЁ])\.\s+([А-ЯЁ][а-яё]+)/g,
    replacement: `$1.${TC.NBSP}$2.${TC.NBSP}$3`,
    description: 'Неразрывные пробелы в инициалах'
  },

  // Приоритет 9.1: Инициал + фамилия (без пробела)
  {
    name: 'initial_dot_surname',
    priority: 9.1,
    pattern: /(^|[\s\u00A0])([А-ЯЁ]\.)([А-ЯЁ][а-яё]+)/g,
    replacement: `$1$2${TC.NBSP}$3`,
    description: 'Неразрывный пробел между инициалом и фамилией'
  },

  // Приоритет 9.2: Инициал с пробелом + фамилия
  {
    name: 'initial_space_surname',
    priority: 9.2,
    pattern: /(^|\s)([А-ЯЁ]\.)\s+([А-ЯЁ][а-яё]+)/g,
    replacement: `$1$2${TC.NBSP}$3`,
    description: 'Неразрывный пробел между инициалом с пробелом и фамилией'
  },

  // Приоритет 9.5: Последовательность инициалов (без пробелов)
  {
    name: 'initials_sequence',
    priority: 9.5,
    pattern: /([А-ЯЁ]\.)([А-ЯЁ]\.)/g,
    replacement: `$1${TC.NBSP}$2`,
    description: 'Неразрывный пробел между инициалами'
  },
  
  // Приоритет 9.6: Последовательность инициалов (с пробелами)
  {
    name: 'initials_sequence_spaced',
    priority: 9.6,
    pattern: /([А-ЯЁ]\.)\s+([А-ЯЁ]\.)/g,
    replacement: `$1${TC.NBSP}$2`,
    description: 'Неразрывные пробелы между инициалами с пробелами'
  },
  
  // Приоритет 9.65: Союзы после инициалов
  {
    name: 'conjunction_after_initials',
    priority: 9.65,
    pattern: /([А-ЯЁ]\.)[ \u00A0]+(и|а|но|да|или|либо)\s+/g,
    replacement: `$1${TC.NBSP}$2${TC.NBSP}`,
    description: 'Неразрывный пробел перед и после союзов после инициалов'
  },

  // Приоритет 8.8: Неразрывный пробел между фамилией и одним инициалом
  {
    name: 'surname_single_initial',
    priority: 8.8,
    pattern: /([А-ЯЁ][а-яё]+)\s+([А-ЯЁ]\.)(?!\s*[А-ЯЁ]\.)/g,
    replacement: `$1${TC.NBSP}$2`,
    description: 'Неразрывный пробел между фамилией и одним инициалом'
  },

  // Приоритет 8.9: Неразрывный пробел между фамилией и инициалами (пример: Антонов В. Д.)
  {
    name: 'surname_separate_initials',
    priority: 8.9,
    pattern: /([А-ЯЁ][а-яё]+)\s+([А-ЯЁ]\.)[ \u00A0]*([А-ЯЁ]\.)/g,
    replacement: `$1${TC.NBSP}$2${TC.NBSP}$3`,
    description: 'Неразрывный пробел между фамилией и инициалами (Антонов В. Д.)'
  },

  // Приоритет 12: Фамилия и инициалы (существующее правило)
  {
    name: 'surname_initials',
    priority: 12,
    pattern: /(\b[А-ЯЁ][а-яё]+)\s+([А-ЯЁ]\.\s*[А-ЯЁ]?\.?)/g,
    replacement: `$1${TC.NBSP}$2`,
    description: 'Неразрывный пробел между фамилией и инициалами'
  },

  // Приоритет 13: Сокращения с цифрами
  {
    name: 'abbreviations_with_numbers',
    priority: 13,
    pattern: /(стр|гл|п|пп|абз)\.(\s+)(\d)/g,
    replacement: `$1.${TC.NBSP}$3`,
    description: 'Неразрывный пробел после сокращений перед цифрами'
  },


  // Приоритет 15: Римские цифры
  {
    name: 'roman_numerals',
    priority: 15,
    pattern: /(\b[IVXLCDM]+)\s+([a-яёА-ЯЁ])/g,
    replacement: `$1${TC.NBSP}$2`,
    description: 'Неразрывный пробел после римских цифр'
  },

  // Приоритет 16: Кавычки (основные)
  {
    name: 'main_quotes',
    priority: 16,
    pattern: /"([^"]*)"/g,
    replacement: `${TC.LEFT_ANGLE_QUOTE}$1${TC.RIGHT_ANGLE_QUOTE}`,
    description: 'Замена прямых кавычек на ёлочки'
  },

  // Приоритет 17: Вложенные кавычки
  {
    name: 'nested_quotes',
    priority: 17,
    pattern: /«([^«»]*)«([^«»]*)»([^«»]*)»/g,
    replacement: `«$1${TC.DOUBLE_LOW_9_QUOTE}$2${TC.RIGHT_DOUBLE_QUOTE}$3»`,
    description: 'Вложенные кавычки (ёлочки → лапки)'
  },

  // Приоритет 18: Апострофы
  {
    name: 'apostrophes',
    priority: 18,
    pattern: /(\w)'(\w)/g,
    replacement: `$1${TC.APOSTROPHE}$2`,
    description: 'Замена прямых апострофов на типографские'
  },

  // Приоритет 19: Многоточие
  {
    name: 'ellipsis',
    priority: 19,
    pattern: /\.{3,}/g,
    replacement: TC.ELLIPSIS,
    description: 'Замена троеточия на символ многоточия'
  },

  // Приоритет 20: Символы авторского права
  {
    name: 'copyright',
    priority: 20,
    pattern: /\(c\)/gi,
    replacement: TC.COPYRIGHT,
    description: 'Замена (c) на символ авторского права'
  },

  {
    name: 'registered',
    priority: 20,
    pattern: /\(r\)/gi,
    replacement: TC.REGISTERED,
    description: 'Замена (r) на символ регистрации'
  },

  {
    name: 'trademark',
    priority: 20,
    pattern: /\(tm\)/gi,
    replacement: TC.TRADEMARK,
    description: 'Замена (tm) на символ торговой марки'
  },

  // Приоритет 100: Замена символов перевода строки на знак абзаца (выполняется в конце)
  {
    name: 'line_breaks_to_paragraph',
    priority: 100,
    pattern: /\r?\n/g,
    replacement: '¶',
    description: 'Замена символов перевода строки на знак абзаца (¶)'
  }
];

export function applySortedRules(text: string, rules: TypographyRule[] = RUSSIAN_TYPOGRAPHY_RULES): string {
  // Сортируем правила по приоритету
  const sortedRules = [...rules].sort((a, b) => a.priority - b.priority);
  
  let result = text;
  
  for (const rule of sortedRules) {
    if (typeof rule.replacement === 'function') {
      result = result.replace(rule.pattern, rule.replacement);
    } else {
      result = result.replace(rule.pattern, rule.replacement);
    }
  }
  
  return result;
}
