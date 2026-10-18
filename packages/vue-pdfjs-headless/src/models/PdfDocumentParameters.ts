import type { PdfApi } from "#src/models/PdfApi";

// The renderer's loading parameters, passed to its loader as given, such as range loading and streaming
export type PdfDocumentParameters = Partial<Parameters<PdfApi["getDocument"]>[0]>;
