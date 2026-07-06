import type { Document } from "@esposter/db-schema";

export interface DocumentProcedures<TContent> {
  createDocument: (input: { name: string }) => Promise<Document>;
  deleteDocument: (input: { id: string }) => Promise<Document>;
  publishDocument: (input: { id: string }) => Promise<Document>;
  // The content comes back as serialized plain data, so the caller rehydrates it through its content class
  readDocumentContent: (input: { id: string }) => Promise<unknown>;
  readDocuments: () => Promise<Document[]>;
  saveDocumentContent: (input: { content: TContent; contentVersion: number; id: string }) => Promise<Document>;
  unpublishDocument: (input: { id: string }) => Promise<Document>;
  updateDocument: (input: { id: string; name: string }) => Promise<Document>;
}
