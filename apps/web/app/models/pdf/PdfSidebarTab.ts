// The views a PDF viewer's sidebar chooses between: the document's outline, a thumbnail of each of its pages, and the
// Comments the reader left on them
export const PdfSidebarTab = { Comments: "Comments", Outline: "Outline", Thumbnails: "Thumbnails" } as const;
export type PdfSidebarTab = (typeof PdfSidebarTab)[keyof typeof PdfSidebarTab];
