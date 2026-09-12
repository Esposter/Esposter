import type { IncomingMessage } from "node:http";

// Node hands a request its headers as a plain object, and the fetch `Headers` the session reader takes is built
// From it the same way whether the request arrived over http or as a websocket upgrade
export const getRequestHeaders = (request: IncomingMessage): Headers =>
  new Headers(Object.entries(request.headers as Record<string, string>));
