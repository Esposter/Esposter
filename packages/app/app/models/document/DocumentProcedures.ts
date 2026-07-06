import type { Document } from "@esposter/db-schema";

export interface DocumentProcedures<TContent> {
  createDocument: (input: { name: string }) => Promise<Document>;
  deleteDocument: (input: { id: string }) => Promise<Document>;
  readDocumentContent: (input: { id: string }) => Promise<unknown>;
  readDocuments: () => Promise<Document[]>;
  saveDocumentContent: (input: { content: TContent; contentVersion: number; id: string }) => Promise<Document>;
  updateDocument: (input: { id: string; name: string }) => Promise<Document>;
}
