import type { IncomingMessage, ServerResponse } from "node:http";

import { HOST_NAME } from "#src/services/server/constants";
// The host serves one WebSocket; plain HTTP exists only for what a browser asks before it opens one. A page on
// `https` reaching a loopback address is checked by the browser's private-network rules, which pass only when the
// Host answers their preflight, and the page looks for a running host with a plain GET before anything is paired.
// Neither reply carries the token or anything else a stranger's page could use.
export const answerHttpRequest = ({ headers, method }: IncomingMessage, response: ServerResponse): void => {
  response.setHeader("Access-Control-Allow-Origin", headers.origin ?? "*");
  response.setHeader("Access-Control-Allow-Private-Network", "true");
  response.setHeader("Vary", "Origin");

  if (method === "OPTIONS") {
    response.setHeader("Access-Control-Allow-Methods", "GET");
    response.setHeader("Access-Control-Allow-Headers", headers["access-control-request-headers"] ?? "*");
    response.writeHead(204).end();
  } else if (method === "GET")
    response.writeHead(200, { "Content-Type": "application/json" }).end(JSON.stringify({ name: HOST_NAME }));
  else response.writeHead(405).end();
};
