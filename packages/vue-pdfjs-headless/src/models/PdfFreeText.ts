// A free-text annotation as XFDF exchanges it: its text, its page one-based as the viewer counts pages, and its rectangle
export interface PdfFreeText {
  contents: string;
  id: string;
  pageNumber: number;
  rect: [number, number, number, number];
}
