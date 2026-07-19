import type { MessageSearchDocument } from "@/services/message/searchIndex/models/MessageSearchDocument";

export interface SearchIndexRestClient {
  countDocumentsByRoom: (roomId: string) => Promise<number>;
  mergeOrUploadDocuments: (documents: MessageSearchDocument[]) => Promise<void>;
}
