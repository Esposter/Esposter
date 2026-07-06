import type { Document } from "@esposter/db-schema";

export const getPublishedContentBlobName = (documentId: Document["id"], publishVersion: Document["publishVersion"]) =>
  `${documentId}/published/${publishVersion}`;
