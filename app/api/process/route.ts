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
      const parentRun = brElement.closest('w\\:r');
      const parentParagraph = brElement.closest('w\\:p');
      
      if (parentRun.length > 0 && parentParagraph.length > 0) {
        // Создаем новый параграф
        const newParagraph = $('<w:p></w:p>');
        
        // Копируем свойства параграфа (если есть)
        const pPr = parentParagraph.find('> w\\:pPr').first();
        if (pPr.length > 0) {
          newParagraph.append(pPr.clone());
        }
        
        // Собираем все runs после текущего run с <w:br/>
        const currentRunIndex = parentParagraph.find('w\\:r').index(parentRun);
        const allRuns = parentParagraph.find('w\\:r');
        const runsAfterBreak: any[] = [];
        
        allRuns.each((idx, run) => {
          if (idx > currentRunIndex) {
            runsAfterBreak.push($(run).clone());
            $(run).remove();
          }
        });
        
        // Разделяем текущий run по месту <w:br/>
        const elementsBeforeBr: any[] = [];
        const elementsAfterBr: any[] = [];
        let foundBr = false;
        
        parentRun.children().each((_, child) => {
          const $child = $(child);
          if ($child.is('w\\:br') && !foundBr) {
            foundBr = true;
            // Удаляем только первый <w:br/>
          } else if (!foundBr) {
            elementsBeforeBr.push($child.clone());
          } else {
            elementsAfterBr.push($child.clone());
          }
        });
        
        // Очищаем текущий run и добавляем только элементы до <w:br/>
        parentRun.empty();
        elementsBeforeBr.forEach(elem => parentRun.append(elem));
        
        // Если есть элементы после <w:br/>, создаем новый run в новом параграфе
        if (elementsAfterBr.length > 0) {
          const newRun = $('<w:r></w:r>');
          
          // Копируем свойства run (если есть)
          const rPr = parentRun.find('> w\\:rPr').first();
          if (rPr.length > 0 && elementsBeforeBr.some(e => $(e).is('w\\:rPr'))) {
            // Если rPr уже был в elementsBeforeBr, берем его из исходного run
            const originalRPr = parentRun.children().filter((_, el) => $(el).is('w\\:rPr')).first();
            if (originalRPr.length > 0) {
              newRun.append($(originalRPr).clone());
            }
          } else if (rPr.length > 0) {
            newRun.append(rPr.clone());
          }
          
          elementsAfterBr.forEach(elem => newRun.append(elem));
          newParagraph.append(newRun);
        }
        
        // Добавляем все runs, которые были после текущего run
        runsAfterBreak.forEach(run => newParagraph.append(run));
        
        // Вставляем новый параграф после текущего
        parentParagraph.after(newParagraph);
        
        // Удаляем обработанный <w:br/>
        brElement.remove();
      } else {
        // Если <w:br/> не в run или paragraph, просто удаляем его
        brElement.remove();
      }
    }
  }
  
  // Обрабатываем все <w:br/> элементы
  processAllBreaks();

  $('w\\:p').each((_, p) => {
    const paragraph = $(p);
    const runs = paragraph.find('w\\:r');

    if (runs.length > 0) {
      // Собираем все текстовые узлы и их содержимое
      const textNodes: Array<{node: any; text: string}> = [];
      
      runs.each((_, r) => {
        const run = $(r);
        const textNode = run.find('w\\:t');
        if (textNode.length > 0) {
          textNodes.push({
            node: textNode,
            text: textNode.text()
          });
        }
      });

      // Если нет текста, пропускаем
      if (textNodes.length === 0) return;

      // Собираем весь текст параграфа
      const fullText = textNodes.map(item => item.text).join('');
      
      // Пропускаем обработку, если абзац пуст или содержит только пробелы
      if (fullText.trim() === '') {
        return;
      }
      
      // Специальная очистка: удаляем пробелы в начале первого текстового узла (но сохраняем тире)
      if (textNodes.length > 0 && textNodes[0].text) {
        textNodes[0].text = textNodes[0].text.replace(/^[ \t\u00A0\u2009]+(?![—–-])/, '');
      }

      // Обрабатываем текст типографикой
      let processedText = TypographyCore.typographText(fullText);
      
      // Дополнительная очистка пробелов в начале строк (после типографики, но сохраняем тире)
      processedText = processedText.replace(/^[ \t\u00A0\u2009]+(?![—–-])/gm, '');
      
      // РАДИКАЛЬНАЯ ОЧИСТКА: удаляем ВСЕ пробелы в начале обработанного текста (но сохраняем тире)
      processedText = processedText.replace(/^[ \t\u00A0\u2009]+(?![—–-])/, '');

      // Если есть только один run, просто заменяем текст
      if (textNodes.length === 1) {
        const preserveSpace = textNodes[0].node.attr('xml:space');
        textNodes[0].node.text(processedText);
        if (preserveSpace || processedText.includes(' ')) {
          textNodes[0].node.attr('xml:space', 'preserve');
        }
        return;
      }

      // Для нескольких runs: создаем соответствие между символами до и после обработки
      let origIndex = 0;
      let procIndex = 0;
      const charMapping: number[] = [0]; // Начинаем с 0 для корректного отображения

      // Строим карту соответствия символов
      while (origIndex < fullText.length && procIndex < processedText.length) {
        charMapping[origIndex] = procIndex;
        
        if (fullText[origIndex] === processedText[procIndex]) {
          origIndex++;
          procIndex++;
        } else {
          // Проверяем специальные случаи замены тире
          const origChar = fullText[origIndex];
          const procChar = processedText[procIndex];
          
          // En-dash → Em-dash замена
          if ((origChar === '–' && procChar === '—') || 
              (origChar === '-' && procChar === '—')) {
            origIndex++;
            procIndex++;
          }
          // Если символы не совпадают, проверяем добавленные спецсимволы
          else {
            const charCode = processedText.charCodeAt(procIndex);
            if (charCode === 0xA0 || // NBSP
                charCode === 0x2009 || // Thin space
                charCode === 0x2011) { // Non-breaking hyphen
              procIndex++;
            } else {
              // Если это не спецсимвол, ищем соответствие дальше
              origIndex++;
            }
          }
        }
      }
      // Добавляем последнюю позицию
      charMapping[fullText.length] = processedText.length;

      // Распределяем обработанный текст обратно по runs
      let currentOrigPos = 0;
      
      textNodes.forEach(item => {
        const runLength = item.text.length;
        const startProc = charMapping[currentOrigPos] || 0;
        const endProc = charMapping[currentOrigPos + runLength] || charMapping[currentOrigPos] || processedText.length;
        
        // Проверяем корректность границ
        const safeStartProc = Math.min(startProc, processedText.length);
        const safeEndProc = Math.min(endProc, processedText.length);
        
        const newText = processedText.substring(safeStartProc, safeEndProc);
        const preserveSpace = item.node.attr('xml:space');
        
        item.node.text(newText);
        if (preserveSpace || newText.includes(' ')) {
          item.node.attr('xml:space', 'preserve');
        }
        
        currentOrigPos += runLength;
      });
    }
  });

  // ФИНАЛЬНАЯ ОЧИСТКА: проходимся по всем параграфам и удаляем пробелы в начале
  $('w\\:p').each((_, p) => {
    const paragraph = $(p);
    const allTextNodes = paragraph.find('w\\:t');
    
    // Проходимся по всем текстовым узлам в параграфе
    let foundFirstNonEmptyNode = false;
    allTextNodes.each((_, node) => {
      const $node = $(node);
      const text = $node.text();
      
      if (!foundFirstNonEmptyNode && text.trim() !== '') {
        // Первый непустой узел - удаляем пробелы в начале (но сохраняем тире)
        const cleanedText = text.replace(/^[ \t\u00A0\u2009]+(?![—–-])/, '');
        if (text !== cleanedText) {
          $node.text(cleanedText);
          if (cleanedText.includes(' ')) {
            $node.attr('xml:space', 'preserve');
          }
        }
        foundFirstNonEmptyNode = true;
      } else if (!foundFirstNonEmptyNode && text.trim() === '') {
        // Пустой узел в начале - удаляем пробелы (но сохраняем тире)
        const cleanedText = text.replace(/^[ \t\u00A0\u2009]+(?![—–-])/, '');
        if (text !== cleanedText) {
          $node.text(cleanedText);
        }
      }
    });
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

// Конфигурация для API Route в App Router
export const maxDuration = 60; // максимальное время выполнения (секунды)
export const dynamic = 'force-dynamic'; // принудительное динамическое рендеринг

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

    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'Файл слишком большой (максимум 50MB)' }, { status: 400 });
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
    const newFileName = `${originalName}_ред.docx`;

    return new NextResponse(docxBuffer as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${encodeURIComponent(newFileName)}"; filename*=UTF-8''${encodeURIComponent(newFileName)}`,
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
