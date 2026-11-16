// The parts of a request a signature covers: its method, its URL with the query, and every header it carries. It is
// Signed at `signedAt`, the clock's reading unless given, so a caller that knows the server's clock runs ahead or behind
// Can sign at the server's time
export interface SigV4Request {
  headers?: HeadersInit | undefined;
  method: string;
  signedAt?: Date;
  url: string | URL;
}
