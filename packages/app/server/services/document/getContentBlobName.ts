import type { Document } from "@esposter/db-schema";

export const getContentBlobName = (documentId: Document["id"]) => `${documentId}/content`;
