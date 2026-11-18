import type { BlobTopic } from "#src/models/realtime/Topic";

// The topic a blob takes in its bucket: the bucket's binding name, then the blob's key
export const getBlobTopic = (bucket: string, key: string): BlobTopic => `${bucket}:${key}`;
