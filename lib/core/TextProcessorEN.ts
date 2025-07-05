import { TextProcessor } from './TextProcessor';

export class TextProcessorEN extends TextProcessor {
  protected processText(text: string): string {
    // Обработка неразрывных пробелов
    text = text.replace(/(\s)([a-z]{1,2})\.(\s|$)/gi, '$1$2 $3');
    
    // Замена дефисов на длинные тире в соответствующих контекстах
    text = text.replace(/\s-\s/g, ' — ');
    text = text.replace(/--/g, '—');
    
    // Замена троеточия на символ многоточия
    text = text.replace(/\.\.\./g, '\u2026');
    
    // Улучшенная обработка английских кавычек
    text = text.replace(/(\W|^)"(\w)/g, '$1“$2');
    text = text.replace(/(\w)"(\W|$)/g, '$1”$2');
    
    // Заменяем одинарные кавычки
    text = text.replace(/'([^']*)'/g, '‘$1’');
    
    // Неразрывный пробел перед тире в цитатах
    text = text.replace(/(\w)\s—/g, '$1\u00A0—');
    
    // Неразрывный дефис в составных словах
    text = text.replace(/([a-z])-([a-z])/gi, '$1\u2011$2');
    
    // Заменяем диапазоны чисел на en-dash
    text = text.replace(/(\d+)\s*-\s*(\d+)/g, '$1–$2');
    
    // Улучшенная обработка множественных апострофов
    text = text.replace(/(\w)['’](\w)/g, '$1’$2');
    
    text = text.replace(/\(c\)/g, '©');
    text = text.replace(/\(r\)/g, '®');
    
    return text;
  }
}
