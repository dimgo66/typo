import { TextProcessor } from './TextProcessor';

const NBSP = '\u00A0'; // Заменяем &nbsp; на юникод
const THIN_SPACE = '\u2009'; // Используем символ тонкого пробела U+2009
const EN_DASH = '–';
const EM_DASH = '—';

export class TextProcessorRU extends TextProcessor {
  protected processText(text: string): string {
    console.log('RU Processor Input:', text);
    // Удаление многократных пробелов (первым!)
    text = text.replace(/\s{2,}/g, ' ');
    
    // Универсальная замена апострофов
    text = text.replace(/(\w)['’](\w)/g, '$1’$2');
    
    // Однобуквенные предлоги и союзы (раньше других правил)
    const singleLetterParticles = ['а', 'а,', 'в', 'и', 'и,', 'к', 'о', 'с', 'у', 'с.', 'т.', 'п.', 'ч.', '"О', '"К', 'В', 'И', 'К', 'О', 'С', 'У', 'А', '"У'];
    const singleLetterRegex = new RegExp(`\\b(${singleLetterParticles.join('|')})\\s+(\\w)`, 'gi');
    text = text.replace(singleLetterRegex, `$1${NBSP}$2`);
    
    // Двухбуквенные частицы
    const twoLetterParticles = ['не', 'ни', 'на', 'ну', 'ну,', 'от', 'об', 'из', 'за', 'да', 'да,', 'но', 'но,', 'по', 'до', 'во', 'со', 'ко', 'та', 'ту', 'то', 'те', 'см.', 'им.'];
    const twoLetterRegex = new RegExp(`\\b(${twoLetterParticles.join('|')})\\s+(\\w)`, 'gi');
    text = text.replace(twoLetterRegex, `$1${NBSP}$2`);
    
    // Обработка неразрывных пробелов
    text = text.replace(/(\s)([a-zа-яё]{1,2})\.(\s|$)/gi, '$1$2 $3');
    
    // Универсальная обработка сокращений (т.д., т.п., и т.д.)
    text = text.replace(/(\s|^)([а-яё]{1,2})\.\s*([а-яё]{1,2})\./gi, '$1$2. $3.');
    
    // Обработка "и т.д." с неразрывными пробелами
    text = text.replace(/\bи\s+т\.\s*д\./g, `и${NBSP}т.${NBSP}д.`);
    
    // Обработка инициалов (А. С. Пушкин)
    text = text.replace(/(\b[А-ЯЁ])\.\s+([А-ЯЁ])\.\s+([А-ЯЁ][а-яё]+)/g, `$1.${NBSP}$2.${NBSP}$3`);
    
    // Замена пробела на тонкий пробел в числовых диапазонах
    text = text.replace(/(\d)\s-\s(\d)/g, '$1 – $2');
    
    // Упрощенная замена тире
    text = text.replace(/\s--\s/g, ` ${EM_DASH} `);
    text = text.replace(/\s-\s/g, ` ${EM_DASH} `);
    
    // Неразрывный пробел перед тире в цитатах
    text = text.replace(/(\w)\s—/g, '$1\u00A0—');
    
    // Неразрывный дефис в составных словах
    text = text.replace(/([а-яё])-([а-яё])/gi, '$1\u2011$2');
    
    // Общие правила типографики
    text = text.replace(/"([^"]*)"/g, '«$1»');
    text = text.replace(/'([^']*)'/g, '‘$1’');
    text = text.replace(/\(c\)/gi, '©');
    text = text.replace(/\(r\)/gi, '®');
    // Замена троеточия на символ многоточия
    text = text.replace(/\.\.\./g, '\u2026');
    
    // Вложенные кавычки (ёлочки → лапки)
    text = text.replace(/«([^«»]*)«([^«»]*)»([^«»]*)»/g, '«$1„$2“$3»');
    
    // Апостроф: базовая замена для слов типа д'Артаньян
    text = text.replace(/([a-zа-яё])'([A-ZА-ЯЁ])/gi, '$1’$2');
    
    // Знак № с неразрывным пробелом
    text = text.replace(/(^|\s)№\s?(\d)/g, `$1№${NBSP}$2`);
    
    // Тонкие пробелы в числах: обрабатываем только числа с 5 и более цифрами
    text = text.replace(/\b(\d{5,})\b/g, (match) => {
      return match.replace(/(\d)(?=(\d{3})+$)/g, `$1${THIN_SPACE}`);
    });
    
    // Фамилия перед инициалами: Иванов А.А. → Иванов А.А.
    text = text.replace(/(\b[А-ЯЁ][а-яё]+)\s+([А-ЯЁ]\.\s*[А-ЯЁ]?\.?)/g, `$1${NBSP}$2`);
    
    // Одиночный инициал после фамилии: Иванов А. → Иванов А.
    text = text.replace(/(\b[А-ЯЁ][а-яё]+)\s+([А-ЯЁ]\.)/g, `$1${NBSP}$2`);
    
    // Цифра + единица измерения
    const units = ['руб', 'кг', 'г', 'мм', 'см', 'м', 'км', 'л', 'Вт', 'W', '°C', 'января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    const unitsRegex = new RegExp(`(\\d)\\s(${units.join('|')})\\b`, 'gi');
    text = text.replace(unitsRegex, `$1${NBSP}$2`);
    
    // Замена минуса на короткое тире
    text = text.replace(/\u2212/g, EN_DASH);
    
    // Короткое тире в интервалах (числовых диапазонах)
    text = text.replace(/(\d)\s*[-–]\s*(\d)/g, `$1${EN_DASH}$2`);
    
    // Неразрывный пробел после римских цифр (XXI век)
    text = text.replace(/(\b[IVXLCDM]+)\s+(\p{L})/giu, `$1${NBSP}$2`);
    
    // Замена дефисов с пробелами на длинное тире
    text = text.replace(/\s-\s/g, ` ${EM_DASH} `);
    
    // Замена дефиса без пробелов на длинное тире (когда окружен словами)
    text = text.replace(/(\w)-(\w)/g, `$1${EM_DASH}$2`);
    
    console.log('RU Processor Output:', text);
    return text;
  }
}
