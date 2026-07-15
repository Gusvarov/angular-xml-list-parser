import { describe, expect, it } from 'vitest';

import {
  parseBooksFromXml,
  serializeBooksToXml,
} from './xml-book.util';

describe('parseBooksFromXml', () => {
  const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<library>
  <book id="a1">
    <title>The Little Mermaid</title>
    <author>Andersen</author>
    <pages>48</pages>
  </book>
  <book>
    <title>The Shining</title>
    <author>King</author>
    <pages>447</pages>
  </book>
</library>`;

  it('parses books from a valid XML document', () => {
    const books = parseBooksFromXml(sampleXml);

    expect(books).toHaveLength(2);
    expect(books[0]).toMatchObject({
      id: 'a1',
      title: 'The Little Mermaid',
      author: 'Andersen',
      pages: 48,
    });
    expect(books[1].title).toBe('The Shining');
    expect(books[1].id).toEqual(expect.any(String));
  });

  it('returns an empty array for an empty library', () => {
    const xml = '<library></library>';
    expect(parseBooksFromXml(xml)).toEqual([]);
  });

  it('throws when the XML is malformed', () => {
    expect(() => parseBooksFromXml('<library><book></library>')).toThrow(
      Error,
    );
  });

  it('throws when the root element is not library', () => {
    expect(() =>
      parseBooksFromXml('<books><book><title>T</title><author>A</author><pages>1</pages></book></books>'),
    ).toThrow(/Expected root element <library>/);
  });

  it('throws when required fields are missing', () => {
    const xml = `<library>
      <book>
        <title>Missing Author</title>
        <pages>10</pages>
      </book>
    </library>`;

    expect(() => parseBooksFromXml(xml)).toThrow(/missing required <author>/);
  });

  it('throws when pages is not a positive integer', () => {
    const xml = `<library>
      <book>
        <title>Bad Pages</title>
        <author>Author</author>
        <pages>0</pages>
      </book>
    </library>`;

    expect(() => parseBooksFromXml(xml)).toThrow(/invalid pages value/);
  });
});

describe('serializeBooksToXml', () => {
  it('serializes books to XML and escapes special characters', () => {
    const xml = serializeBooksToXml([
      {
        id: 'book-1',
        title: 'Tom & Jerry',
        author: 'O\'Neil',
        pages: 120,
      },
    ]);

    expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xml).toContain('<library>');
    expect(xml).toContain('<book id="book-1">');
    expect(xml).toContain('<title>Tom &amp; Jerry</title>');
    expect(xml).toContain('<author>O\'Neil</author>');
    expect(xml).toContain('<pages>120</pages>');
  });

  it('round-trips books through parse and serialize', () => {
    const original = [
      {
        id: '1',
        title: 'The Ugly Duckling',
        author: 'Andersen',
        pages: 32,
      },
      {
        id: '2',
        title: 'It',
        author: 'King',
        pages: 1138,
      },
    ];

    const roundTripped = parseBooksFromXml(serializeBooksToXml(original));
    expect(roundTripped).toEqual(original);
  });
});
