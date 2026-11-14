import type { BlobEntry } from "#src/models/cutover/BlobEntry";

// Whether a blob's content is text, the kind a copy reads whole to rewrite the ids it names. A resource's content is JSON, which names its
// rows and its resource by id
export const isTextualBlob = (blob: BlobEntry): boolean => /^(application\/json|text\/)/.test(blob.contentType ?? "");
