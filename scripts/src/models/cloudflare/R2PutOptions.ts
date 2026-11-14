// The headers a stored object is written with. `createOnly` refuses a write over a key that is already taken
export interface R2PutOptions {
  cacheControl?: string;
  contentEncoding?: string;
  contentType?: string;
  createOnly?: boolean;
}
