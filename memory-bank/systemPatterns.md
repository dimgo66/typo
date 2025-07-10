# Системные паттерны

## Архитектура обработки текста

### Основные компоненты
1. **TextProcessor** - базовый класс для обработки текста
2. **TextProcessorRU** - специализированный процессор для русского языка
3. **RussianTypographyRules** - набор правил русской типографики
4. **processDocxXml** - функция обработки DOCX файлов с сохранением форматирования

### Критические паттерны сохранения форматирования

#### Обработка runs в DOCX
```typescript
// Каждый run обрабатывается отдельно для сохранения форматирования
const runs = $(paragraph).find('w\\:r');
runs.each((index, run) => {
  const textNodes = $(run).find('w\\:t');
  // Обработка каждого текстового узла в run
});
```

#### Карта соответствия символов
```typescript
// Отслеживание изменений длины текста при типографике
const createCharacterMap = (original: string, processed: string) => {
  // Создание карты для корректного распределения текста по runs
};
```

### Паттерны типографических правил

#### Порядок применения правил (по приоритету)
1. **Приоритет 1-5**: Базовые правила очистки
   - Удаление лишних пробелов
   - Нормализация переносов строк

2. **Приоритет 6-10**: Структурные правила
   - Обработка апострофов
   - Замена кавычек
   - Обработка диалогов

3. **Приоритет 11-15**: Специализированные правила
   - Числовые диапазоны (высший приоритет)
   - Инициалы и фамилии
   - Даты и годы

4. **Приоритет 16-20**: Универсальные правила
   - Числа с единицами измерения
   - Предлоги и союзы
   - Замена тире

### Критические паттерны для кириллицы

#### Проблема с \b в JavaScript
```javascript
// НЕПРАВИЛЬНО - не работает с кириллицей
pattern: /\bслово\b/g

// ПРАВИЛЬНО - использование negative lookahead
pattern: /(?<![а-яёА-ЯЁ])слово(?![а-яёА-ЯЁ])/g
```

#### Универсальные правила вместо специализированных
```typescript
// Один универсальный паттерн для всех чисел с единицами
{
  name: 'numbers_with_units_universal',
  pattern: /(\d+(?:[.,]\d+)?)\s+([а-яёА-ЯЁ]+)(?![а-яёА-ЯЁ])/g,
  replacement: '$1\u00A0$2',
  priority: 18
}
```

### Паттерны обработки XML

#### Сохранение xml:space атрибутов
```typescript
// Важно сохранять xml:space="preserve" для корректного отображения
if (textNode.attr('xml:space') === 'preserve') {
  newTextNode.attr('xml:space', 'preserve');
}
```

#### Обработка сносок
```typescript
// Footnotes обрабатываются отдельно
const footnotesXml = zip.file('word/footnotes.xml');
if (footnotesXml) {
  const footnotesContent = footnotesXml.asText();
  const processedFootnotes = processXmlContent(footnotesContent);
  zip.file('word/footnotes.xml', processedFootnotes);
}
```

### Паттерны тестирования

#### Изолированное тестирование правил
```typescript
// Тестирование каждого правила в изоляции
const testRule = (rule: TypographyRule, input: string, expected: string) => {
  const result = input.replace(rule.pattern, rule.replacement);
  expect(result).toBe(expected);
};
```

#### Комплексное тестирование
```typescript
// Тестирование полного цикла обработки
const testFullProcessing = (input: string, expected: string) => {
  const processor = new TextProcessorRU();
  const result = processor.process(input);
  expect(result).toBe(expected);
};
```

### Паттерны отладки

#### Пошаговая отладка правил
```typescript
// Отслеживание применения каждого правила
const debugProcessing = (text: string, rules: TypographyRule[]) => {
  let result = text;
  rules.forEach(rule => {
    const before = result;
    result = result.replace(rule.pattern, rule.replacement);
    if (before !== result) {
      console.log(`Rule ${rule.name}: ${before} → ${result}`);
    }
  });
  return result;
};
```

### Новые паттерны (январь 2025)

#### Автоматическое разбиение переносов строк
```typescript
// Функция для обработки всех <w:br/> в документе
function processAllBreaks() {
  let hasBreaks = true;
  
  // Продолжаем обработку пока есть <w:br/> элементы
  while (hasBreaks) {
    const breaks = $('w\\:br');
    hasBreaks = breaks.length > 0;
    
    if (!hasBreaks) break;
    
    // Обрабатываем первый найденный <w:br/>
    const brElement = breaks.first();
    // Создаем новый параграф с сохранением форматирования
    // ...
  }
}
```

#### Радикальная очистка пробелов
```typescript
// Правило с приоритетом -2
{
  name: 'remove_leading_spaces_comprehensive',
  priority: -2,
  pattern: /(^|\r?\n)(\t*)[ \f\v]+/gm,
  replacement: (match: string, lineStart: string, tabs: string) => {
    // Сохраняем табуляции для поэзии
    return lineStart + tabs;
  },
  description: 'Универсальное удаление обычных пробелов в начале строк'
}
```

#### Очистка после типографики
```typescript
// Дополнительная очистка пробелов в начале строк (после типографики)
processedText = processedText.replace(/^[ \t\u00A0\u2009]+/gm, '');

// РАДИКАЛЬНАЯ ОЧИСТКА: удаляем ВСЕ пробелы в начале обработанного текста
processedText = processedText.replace(/^[ \t\u00A0\u2009]+/, '');
```

#### Специальная очистка первого узла
```typescript
// Специальная очистка: удаляем пробелы в начале первого текстового узла
if (textNodes.length > 0 && textNodes[0].text) {
  textNodes[0].text = textNodes[0].text.replace(/^[ \t\u00A0\u2009]+/, '');
}
```

#### Обработка кириллических границ слов
```typescript
// Правильный подход для кириллицы
pattern: /(?<![а-яёА-ЯЁ])слово(?![а-яёА-ЯЁ])/g

// Неправильный подход (не работает)
pattern: /\bслово\b/g
```

#### Приоритеты правил типографики
```typescript
// Приоритет -2: Радикальная очистка пробелов
// Приоритет 1: Базовые правила очистки
// Приоритет 1.1-1.2: Диапазоны дат и римских цифр
// Приоритет 1.9-1.95: Различные виды тире
// Приоритет 2-2.5: Замена тире на длинное
// Приоритет 3: Числовые диапазоны
// Приоритет 4: Неразрывные дефисы
// Приоритет 5-5.5: Предлоги и союзы
```

## Ключевые принципы архитектуры

1. **Модульность** - каждый процессор отвечает за свой язык
2. **Приоритизация** - правила применяются в строгом порядке
3. **Сохранение контекста** - форматирование и структура документа не теряются
4. **Универсальность** - общие правила предпочтительнее специализированных
5. **Отладочность** - возможность пошаговой отладки применения правил
6. **Тестируемость** - каждое правило можно тестировать изолированно
7. **Стабильность** - система работает стабильно и предсказуемо
8. **Документированность** - все изменения и решения задокументированы
