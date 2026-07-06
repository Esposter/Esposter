import { DocumentType } from "@esposter/db-schema";

export const DocumentTypeIconMap = {
  [DocumentType.Dashboard]: "mdi-view-dashboard-edit",
  [DocumentType.Email]: "mdi-email-edit",
  [DocumentType.Flowchart]: "mdi-sitemap",
  [DocumentType.Table]: "mdi-table-edit",
  [DocumentType.Webpage]: "mdi-language-html5",
} as const satisfies Record<DocumentType, string>;
