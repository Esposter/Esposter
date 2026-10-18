import type * as PdfJs from "pdfjs-dist";

// The renderer's API module, as the consumer imported it, so the build the consumer chose is the one loaded
export type PdfApi = Pick<typeof PdfJs, "getDocument" | "GlobalWorkerOptions" | "PasswordResponses">;
