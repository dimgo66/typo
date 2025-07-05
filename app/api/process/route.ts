import { NextRequest, NextResponse } from 'next/server';
import PizZip from 'pizzip';
import * as cheerio from 'cheerio';
import { TypographyCore } from '@/lib/core/TypographyCore';

function transliterate(str: string): string {
  const map: Record<string, string> = {
    А: 'A', Б: 'B', В: 'V', Г: 'G', Д: 'D', Е: 'E', Ё: 'E', Ж: 'Zh', З: 'Z', И: 'I', Й: 'Y', К: 'K', Л: 'L', М: 'M', Н: 'N', О: 'O', П: 'P', Р: 'R', С: 'S', Т: 'T', У: 'U', Ф: 'F', Х: 'Kh', Ц: 'Ts', Ч: 'Ch', Ш: 'Sh', Щ: 'Shch', Ъ: '', Ы: 'Y', Ь: '', Э: 'E', Ю: 'Yu', Я: 'Ya',
    а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
    ' ': '_', '—': '-', '–': '-', ',': '', '.': '', '«': '', '»': '', '(': '', ')': '', '[': '', ']': '', '{': '', '}': '', '/': '-', '\\': '-', '@': 'at', '#': '', '$': '', '%': '', '^': '', '&': '', '*': '', '+': '', '=': '', ':': '', ';': '', '?': '', '!': '', '"': '', '\'': '', '<': '', '>': '', '|': '', '`': '', '~': ''
  };
  return str.split('').map(char => map[char] !== undefined ? map[char] : char).join('');
}

function processDocxXml(xml: string): string {
  const $ = cheerio.load(xml, { xmlMode: true });

  $('w\\:p').each((_, p) => {
    const paragraph = $(p);
    const textNodes = paragraph.find('w\\:t');

    if (textNodes.length > 0) {
      // 1. Собрать весь текст из всех узлов <w:t> в параграфе
      const fullText = textNodes.map((_, t) => $(t).text()).get().join('');

      // Пропускаем обработку, если абзац пуст или содержит только пробелы
      if (fullText.trim() === '') {
        return;
      }



      // 2. Обработать собранный текст
      const processedText = TypographyCore.typographText(fullText);

      // 3. Заменить содержимое параграфа
      // Помещаем весь обработанный текст в первый узел <w:t>
      textNodes.first().text(processedText);
      // Удаляем все остальные узлы <w:t>, чтобы избежать дублирования
      textNodes.slice(1).remove();
    }
  });

  // Удаление лишних пустых параграфов для чистоты документа
  let consecutiveEmpty = 0;
  $('w\\:p').each((_, p) => {
    const elem = $(p);
    if (elem.find('w\\:t').text().trim() === '') {
      consecutiveEmpty++;
      if (consecutiveEmpty > 1) {
        elem.remove();
      }
    } else {
      consecutiveEmpty = 0;
    }
  });

  return $.xml();
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'Файл не найден' }, { status: 400 });
    }

    if (!file.name.toLowerCase().endsWith('.docx')) {
      return NextResponse.json({ error: 'Поддерживаются только файлы DOCX.' }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Файл слишком большой (максимум 10MB)' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const zip = new PizZip(arrayBuffer);

    const filesToProcess = ['word/document.xml', 'word/footnotes.xml'];

    filesToProcess.forEach(fileName => {
      const file = zip.file(fileName);
      if (file) {
        const xml = file.asText();
        const processedXml = processDocxXml(xml);
        zip.file(fileName, processedXml);
      }
    });

    const docxBuffer = zip.generate({ type: 'nodebuffer' });

    const originalName = file.name.replace(/\.docx$/i, '');
    const transliteratedName = transliterate(originalName);
    const newFileName = `${transliteratedName}.docx`;

    return new NextResponse(docxBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(newFileName)}"; filename*=UTF-8''${encodeURIComponent(originalName + '.docx')}`,
        'Content-Length': docxBuffer.length.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('[SERVER ERROR]', error);
    return NextResponse.json({ error: 'Ошибка на сервере: ' + errorMessage }, { status: 500 });
  }
}
