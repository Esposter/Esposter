// The headers a streamed object is stored with. `size` is its Content-Length, which R2 requires of a single PUT
export interface R2PutStreamOptions {
  cacheControl?: string;
  contentDisposition?: string;
  contentEncoding?: string;
  contentType?: string;
  size: number;
}
