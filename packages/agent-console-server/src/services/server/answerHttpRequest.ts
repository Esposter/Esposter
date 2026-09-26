import type { IncomingMessage, ServerResponse } from "node:http";

// The host serves one WebSocket; plain HTTP exists only for the private-network preflight a browser may send before
// A page on `https` reaches a loopback address. Anything else is refused with nothing a stranger's page could read,
// So a page on another site cannot even learn that a host is running here
export const answerHttpRequest = ({ headers, method }: IncomingMessage, response: ServerResponse): void => {
  if (method !== "OPTIONS") {
    response.writeHead(405).end();
    return;
  }

  response.setHeader("Access-Control-Allow-Origin", headers.origin ?? "*");
  response.setHeader("Access-Control-Allow-Private-Network", "true");
  response.setHeader("Access-Control-Allow-Methods", "GET");
  response.setHeader("Access-Control-Allow-Headers", headers["access-control-request-headers"] ?? "*");
  response.setHeader("Vary", "Origin");
  response.writeHead(204).end();
};
