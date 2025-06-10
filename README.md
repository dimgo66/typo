# Typography App

> 🇷🇺 Автоматическая типографская обработка русскоязычных .docx с сохранением форматирования и сносок
> 
> 🇬🇧 Automatic Russian typography for .docx files with formatting and footnotes preserved

---

## 📄 Описание / Description

**Typography App** — это серверное приложение для автоматической типографской обработки русскоязычных документов в формате .docx. Сохраняет форматирование, структуру и сноски, обеспечивает строгие правила типографики и диагностику ошибок XML.

**Typography App** is a server-side tool for automatic Russian typography processing of .docx files. It preserves formatting, structure, and footnotes, applies strict typography rules, and provides XML error diagnostics.

---

## 🚀 Основные возможности / Features
- Поддержка только .docx (Word 2007+)
- Сохранение форматирования и сносок (footnotes)
- Транслитерация имени выходного файла
- Строгие правила типографики (длинное тире, диапазоны, сокращения, неразрывные пробелы и др.)
- Диагностика и информирование об ошибках XML
- Прозрачная архитектура, легко расширяется

---

## 🏗️ Архитектура / Architecture
- **Next.js API Route** — серверная обработка
- **PizZip** — работа с .docx (чтение/запись XML)
- **AdvancedTypographyProcessor** — собственный модуль типографики
- **TypeScript** — строгая типизация
- **Документация** — в папке `docs/` (Project.md, Tasktracker.md, Diary.md, qa.md)

---

## ⚡ Быстрый старт / Quick Start

```bash
# Клонируйте репозиторий
 git clone https://github.com/dimgo66/typography.git
 cd typography

# Установите зависимости
 npm install

# Запустите в режиме разработки
 npm run dev

# Для production-сборки
 npm run build
 npm start
```

---

## 📚 Документация / Documentation
- [Project.md](./docs/Project.md) — цели, архитектура, стандарты
- [Tasktracker.md](./docs/Tasktracker.md) — задачи и прогресс
- [Diary.md](./docs/Diary.md) — история изменений
- [qa.md](./docs/qa.md) — вопросы и архитектурные решения
- [README-USAGE.md](./README-USAGE.md) — инструкция для пользователей

---

## ❗ Ограничения / Limitations
- Только .docx (doc, txt и др. не поддерживаются)
- Обрабатываются только document.xml и footnotes.xml
- Не изменяются endnotes, headers, comments и др.
- Требуется Node.js 18+

---

## 🛠️ Технологии / Tech Stack
- Next.js 14
- TypeScript
- PizZip
- Node.js Buffer
- TailwindCSS (UI)

---

## 📝 FAQ
- **Q:** Поддерживаются ли .doc, .txt?  
  **A:** Нет, только .docx.
- **Q:** Сохраняются ли сноски?  
  **A:** Да, обрабатывается footnotes.xml.
- **Q:** Можно ли расширить правила типографики?  
  **A:** Да, модуль типографики легко расширяется.
- **Q:** Какой формат выходного файла?  
  **A:** .docx с транслитерированным именем.

---

## 📬 Обратная связь / Feedback
Вопросы, баги и предложения — через [issues](https://github.com/dimgo66/typography/issues) или напрямую Дмитрию Алексеевичу.

---

**© 2024 Дмитрий Алексеевич / dimgo66** 