import type { R2Object } from "#src/models/cutover/R2Object";
import type { R2PutStreamOptions } from "#src/models/cutover/R2PutStreamOptions";

// The calls the cutover makes against R2's S3 API. Each is one request, except a multipart upload, which is several and
// Aborts itself on a failure. Every failure throws naming the object it was for
export interface R2Client {
  deleteObject: (bucket: string, key: string) => Promise<void>;
  getText: (bucket: string, key: string) => Promise<string | undefined>;
  headObject: (bucket: string, key: string) => Promise<R2Object | undefined>;
  listObjects: (bucket: string) => AsyncGenerator<R2Object>;
  // Resolves to the ETag R2 stored, without its quotes
  putStream: (
    bucket: string,
    key: string,
    body: ReadableStream<Uint8Array>,
    options: R2PutStreamOptions,
  ) => Promise<string>;
  putText: (bucket: string, key: string, text: string) => Promise<void>;
  uploadMultipart: (bucket: string, key: string, chunks: AsyncIterable<Uint8Array>) => Promise<void>;
}
