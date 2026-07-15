import { Book, BookInput } from '../models/book.model';

const BOOK_ELEMENT = 'book';
const LIBRARY_ELEMENT = 'library';

export function parseBooksFromXml(xml: string): Book[] {
  const parser = new DOMParser();
  const document = parser.parseFromString(xml, 'application/xml');
  const parserError = document.querySelector('parsererror');
  if (parserError) {
    throw new Error('Invalid XML document.');
  }

  const root = document.documentElement;
  if (root.tagName !== LIBRARY_ELEMENT) {
    throw new Error(
      `Expected root element <${LIBRARY_ELEMENT}>, found <${root.tagName}>.`,
    );
  }

  const bookElements = Array.from(root.getElementsByTagName(BOOK_ELEMENT));
  if (bookElements.length === 0) {
    return [];
  }

  return bookElements.map((element, index) => parseBookElement(element, index));
}

export function createBookFromXml(input: BookInput, id: string = crypto.randomUUID()): Book {
  return { id, ...input };
}

function parseBookElement(element: Element, index: number): Book {
  const title = getStringFromElementt(element, 'title', index);
  const author = getStringFromElementt(element, 'author', index);
  const pagesText = getStringFromElementt(element, 'pages', index);
  const pages = Number(pagesText);

  if (!Number.isInteger(pages) || pages <= 0) {
    throw new Error(
      `Book at index ${index} has invalid pages value "${pagesText}".`,
    );
  }

  const id = element.getAttribute('id')?.trim() || crypto.randomUUID();
  return createBookFromXml({ title, author, pages }, id);
}

function getStringFromElementt(
  element: Element,
  tagName: string,
  index: number,
): string {
  const child = element.getElementsByTagName(tagName)[0];
  const value = child?.textContent?.trim() ?? '';

  if (!value) {
    throw new Error(
      `Book at index ${index} is missing required <${tagName}> value.`,
    );
  }

  return value;
}

export function serializeBooksToXml(books: readonly Book[]): string {
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<${LIBRARY_ELEMENT}>`,
  ];

  for (const book of books) {
    lines.push(
      `      <book id="${replaceWithXmlAttributeChars(book.id)}">
        <title>${replaceWithXmlChars(book.title)}</title>
        <author>${replaceWithXmlChars(book.author)}</author>
        <pages>${book.pages}</pages>
      </book>`);
  }

  lines.push(`</${LIBRARY_ELEMENT}>`);
  return lines.join('\n');
}

function replaceWithXmlChars(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function replaceWithXmlAttributeChars(value: string): string {
  return replaceWithXmlChars(value).replaceAll('"', '&quot;');
}

export function downloadXmlFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
