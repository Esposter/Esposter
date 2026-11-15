// The renderer's annotation editor modes, each with the value pdf.js's AnnotationEditorType gives it
export const PdfEditorMode = { None: 0, FreeText: 3, Highlight: 9, Stamp: 13, Ink: 15 } as const;
export type PdfEditorMode = (typeof PdfEditorMode)[keyof typeof PdfEditorMode];
