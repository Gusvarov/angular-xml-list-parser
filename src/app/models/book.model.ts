export interface Book {
  id: string;
  title: string;
  author: string;
  pages: number;
}

export interface BookInput {
  title: string;
  author: string;
  pages: number;
}

export type BookSortMode = 'default' | 'title' | 'authorGroup';
