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

## Ключевые принципы архитектуры

1. **Модульность** - каждый процессор отвечает за свой язык
2. **Приоритизация** - правила применяются в строгом порядке
3. **Сохранение контекста** - форматирование и структура документа не теряются
4. **Универсальность** - общие правила предпочтительнее специализированных
5. **Отладочность** - возможность пошаговой отладки применения правил
6. **Тестируемость** - каждое правило можно тестировать изолированно
