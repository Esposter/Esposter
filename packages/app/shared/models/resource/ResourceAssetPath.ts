export interface ResourceAssetPath {
  // Decoded, e.g. "{resourceId}/files/{uuid}|{filename}"
  blobName: string;
  isPublished: boolean;
  resourceId: string;
}
