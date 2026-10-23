// A text annotation a reader left on a page, its page one-based as the viewer counts pages
export interface PdfComment {
  contents: string;
  pageNumber: number;
}
