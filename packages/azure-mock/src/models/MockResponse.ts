import type { HttpHeadersLike, WebResourceLike } from "@azure/core-http-compat";

export interface MockResponse {
  headers: HttpHeadersLike;
  parsedHeaders: Record<string, never>;
  request: WebResourceLike;
  status: number;
}
