import type { ResourceInResource } from "@esposter/db-schema";

export interface ResourceAssetPath {
  // Decoded, e.g. "{resourceId}/files/{hash}"
  blobName: string;
  // The lowercase hex SHA-256 of the file's bytes, which is the blob name's last segment
  hash: string;
  resourceId: ResourceInResource["id"];
}
