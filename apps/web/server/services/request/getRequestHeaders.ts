import type { IncomingMessage } from "node:http";

// Node hands a websocket upgrade its headers as a plain object, and the fetch `Headers` every procedure reads is built
// From it, the shape an http request's already are
export const getRequestHeaders = (request: IncomingMessage): Headers =>
  new Headers(Object.entries(request.headers as Record<string, string>));
