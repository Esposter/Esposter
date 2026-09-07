import type { Resource } from "@esposter/db-schema";

export interface ResourceAssetPath {
  // Decoded, e.g. "{resourceId}/files/{uuid}|{filename}"
  blobName: string;
  isPublished: boolean;
  resourceId: Resource["id"];
}
