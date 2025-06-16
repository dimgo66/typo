import * as cheerio from 'cheerio';

// Расширенная типографская обработка с сохранением форматирования
export interface FormattedText {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontSize?: number;
  color?: string;
}

export interface FormattedParagraph {
  content: FormattedText[];
  style?: 'normal' | 'heading1' | 'heading2' | 'poetry' | 'quote';
  alignment?: 'left' | 'center' | 'right' | 'justify';
  indent?: number;
  tabStops?: number[];
}

export interface ProcessedDocument {
  paragraphs: FormattedParagraph[];
  metadata: {
    isPoetry: boolean;
    hasFormatting: boolean;
    originalLength: number;
    processedLength: number;
  };
}

export class AdvancedTypographyProcessor {
  private static readonly NON_BREAKING_SPACE = '\u00A0';
  private static readonly THIN_SPACE = '\u2009';
  private static readonly EM_DASH = '—';
  private static readonly ELLIPSIS = '…';
  private static readonly EN_DASH = '–';

  /**
   * Определяет, является ли текст стихотворением
   */
  static isPoetry(text: string): boolean {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    if (lines.length < 2) return false;

    let poetryScore = 0;
    const avgLineLength = lines.reduce((sum, line) => sum + line.trim().length, 0) / lines.length;
    if (avgLineLength < 60) poetryScore += 2;

    const lineBreaks = (text.match(/\n/g) || []).length;
    const wordCount = text.split(/\s+/).length;
    if (wordCount > 0 && lineBreaks / wordCount > 0.1) poetryScore += 2;

    const indentedLines = lines.filter(line => line.match(/^\s{2,}/) || line.startsWith('\t')).length;
    if (indentedLines / lines.length > 0.3) poetryScore += 3;

    const capitalizedLines = lines.filter(line => /^[А-ЯЁA-Z]/.test(line.trim())).length;
    if (capitalizedLines / lines.length > 0.7) poetryScore += 1;

    const lineLengths = lines.map(line => line.trim().length);
    const lengthVariance = lineLengths.reduce((sum, len) => sum + Math.pow(len - avgLineLength, 2), 0) / lineLengths.length;
    if (lengthVariance < 100) poetryScore += 1;

    return poetryScore >= 5;
  }

  /**
   * Основной метод обработки текста
   */
  static processText(text: string): string {
    if (this.isPoetry(text)) {
      return this.processPoetryText(text);
    }
    return this.processRegularText(text);
  }

  /**
   * Алиас для обратной совместимости (старые вызовы TypographyProcessor.process)
   */
  static process(text: string): string {
    return this.processText(text);
  }

  /**
   * Обработка обычного текста
   */
  static processRegularText(text: string): string {
    return this.applyBasicRules(text);
  }

  /**
   * Обработка стихов (более мягкие правила)
   */
  static processPoetryText(text: string): string {
    let processedText = text;
    // В стихах применяем только самые необходимые правила,
    // чтобы не нарушить авторский ритм и разбивку строк.
    // Двойной дефис → длинное тире
    processedText = processedText.replace(/--/g, this.EM_DASH);
    // Одиночный дефис или короткое тире в конце строки → длинное тире
    processedText = processedText.replace(/[-–]\s*$/gm, this.EM_DASH);
    processedText = processedText.replace(/(^|\s|[(])\"/g, `$1«`); // Кавычки-елочки
    processedText = processedText.replace(/\"($|\s|[.,:;!?)\\])/g, `»$1`);
    return processedText;
  }

  /**
   * Применение базовых правил типографики
   */
  private static applyBasicRules(text: string): string {
    if (!text || typeof text !== 'string') return text;

    const NBSP = this.NON_BREAKING_SPACE;
    const THIN_SPACE = this.THIN_SPACE;
    const EM_DASH = this.EM_DASH;
    const ELLIPSIS = this.ELLIPSIS;

    // Защита составных слов и специальных конструкций
    const protectedWords: string[] = [];
    const protect = (match: string): string => {
      protectedWords.push(match);
      return `__PROTECTED_${protectedWords.length - 1}__`;
    };
    text = text.replace(/\b(кто-то|что-то|где-то|когда-то|как-то|какой-то|чей-то|кое-кто|кое-что|кое-где|кое-когда|кое-как|кое-какой|из-за|из-под)\b/gi, protect);
    text = text.replace(/\b[А-Яа-я]+-[А-Яа-я]+\b/g, protect); // слова через дефис
    // Числовые диапазоны: заменяем дефис/короткое тире на en-dash
    text = text.replace(/(\d+)\s*[-–]\s*(\d+)/g, `$1${this.EN_DASH}$2`);
    // Диапазоны римскими цифрами (например, IV–VI)
    text = text.replace(/\b([IVXLCDM]+)\s*[-–]\s*([IVXLCDM]+)\b/gi, `$1${this.EN_DASH}$2`);

    // Нормализация пробелов и спецсимволов
    text = text.replace(/\s+/g, ' '); // Схлопываем множественные пробелы
    text = text.replace(/(\.\.\.|\s\.\s\.)/g, ELLIPSIS); // Многоточие
    text = text.replace(/ - /g, ` ${EM_DASH} `); // Одиночное тире
    text = text.replace(/--/g, EM_DASH); // Двойной дефис
    // Замена короткого тире/дефиса между словами на длинное тире
    text = text.replace(/(?:\s|\u00A0)(?:-|–)(?:\s|\u00A0)/g, `${NBSP}${EM_DASH} `);

    // Замена дефиса/тире на длинное тире в начале строки (прямая речь)
        // Обрабатываем любой вид дефиса/тире в начале строки
        // Замена дефиса/тире (одного символа) в начале строки
        // Диалог: только если первый символ именно дефис или короткий en-dash
    text = text.replace(/^(\s*)(?:-|–)\s+/gm, `$1${EM_DASH} `);

    // Кавычки-елочки
    text = text.replace(/(^|\s|[(])\"/g, `$1«`);
    text = text.replace(/\"($|\s|[.,:;!?)\\])/g, `»$1`);
    
    // Внутренние кавычки-лапки (если елочки уже открыты)
    text = text.replace(/«([^»]*)“/g, '«$1„');
    text = text.replace(/”([^«]*)»/g, '“$1»');

    // Неразрывные пробелы
    // Предлоги и союзы (1-2 буквы) с использованием lookahead
        text = text.replace(/(\s)([a-яА-Я]{1,2})\s+/g, `$1$2${NBSP}`);
    // Частицы не, же, бы, ли с использованием lookahead
        text = text.replace(/(\s)(не|ни|же|бы|ли|ль)\s+/gi, `$1$2${NBSP}`);
    // Инициалы (А.С. Пушкин)
    text = text.replace(/([А-Я]\.)\s([А-Я]\.)\s([А-Я][а-я]+)/g, `$1${NBSP}$2${NBSP}$3`);
    // Сокращения (и т. д., и т. п.)
    text = text.replace(/(\s)(и|а)\s(т\.|тд|тп)\./g, `$1$2${NBSP}$3.`);
    // г. Москва
    text = text.replace(/(\s)(г|д|пос|ул|пр|пл|пер|д-р)\.\s([А-Я])/g, `$1$2.${NBSP}$3`);
    // Числа с единицами измерения
    text = text.replace(/(\d)\s(кг|г|м|см|мм|л|мл|руб|коп|тыс|млн|млрд)\b/g, `$1${NBSP}$2`);
    // NBSP между числом и словом (например 1917 года)
    text = text.replace(/(\d+)\s([А-Яа-яA-Za-zЁё]+)/g, `$1${NBSP}$2`);
    // Тире
    text = text.replace(/(\S)\s—\s(\S)/g, `$1${NBSP}— $2`);
    // Номера
    text = text.replace(/(\s)(№|§)\s?(\d)/g, `$1$2${NBSP}$3`);

    // Расстановка тонких пробелов
    text = text.replace(/([.,:;!?])([»”’])/g, `$1${THIN_SPACE}$2`);
    text = text.replace(/([«“‘])(\S)/g, `$1${THIN_SPACE}$2`);
    text = text.replace(/(\S)([»”’])/g, `$1${THIN_SPACE}$2`);

    // Восстановление защищенных слов
    text = text.replace(/__PROTECTED_(\d+)__/g, (match, index) => protectedWords[parseInt(index, 10)]);
    // Удаляем случайные дубликаты неразрывных пробелов
    text = text.replace(/\u00A0{2,}/g, NBSP);
    // Убираем пробелы после NBSP, если они случайно остались
    text = text.replace(/\u00A0\s+/g, NBSP);
    // Убираем пробелы после открывающей и перед закрывающей кавычки
    text = text.replace(/«\s+/g, '«');
    text = text.replace(/\s+»/g, '»');

    // Удаление пробелов в начале и конце строки
    return text.trim();
  }

  static getTestText(): string {
    return (
      'Это тестовый текст для демонстрации работы типографа. ' +
      'Он содержит "кавычки", дефисы в словах типа кто-то, ' +
      'а также длинные тире — например, здесь. ' +
      'Диапазоны чисел, как 1-10, и двойные дефисы -- тоже обрабатываются. ' +
      'И, конечно, сокращения, такие как и т. д. или г. Москва, ' +
      'инициалы А. С. Пушкин и многое другое.'
    );
  }

  /**
   * Алиас для загрузки примера текста (совместимость)
   */
  static getExampleText(): string {
    return this.getTestText();
  }

  // Статический метод для обработки HTML
  static processHtml(html: string): string {
    const $ = cheerio.load(html, {
      xml: { decodeEntities: false },
      xmlMode: true,
    });

    $('body').find('*').each((_, element) => {
      const el = $(element);
      // Обрабатываем только текстовые узлы, игнорируя теги
      el.contents().each((__, node) => {
        if (node.type === 'text') {
          const textNode = $(node);
          const originalText = textNode.text();
          const processedText = this.processRegularText(originalText);
          textNode.replaceWith(processedText);
        }
      });
    });
    
    return $('body').html() || '';
  }
}

// Экспорт для обратной совместимости
export const TypographyProcessor = AdvancedTypographyProcessor;

// Функции-обертки для простого использования
export function typographText(text: string, options: { isFirst?: boolean } = {}): string {
  if (options.isFirst) {
    // Более простая обработка для первого параграфа, если нужно
    return AdvancedTypographyProcessor.processRegularText(text);
  }
  return AdvancedTypographyProcessor.processRegularText(text);
}

export function typographHtml(html: string): string {
  if (!html) return '';
  return AdvancedTypographyProcessor.processHtml(html);
}
