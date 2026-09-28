import type { IncomingMessage, ServerResponse } from "node:http";

import { HOST_CHALLENGE_HEADER } from "#src/services/server/constants";
import { getHostProof } from "#src/services/server/getHostProof";

// The host serves one WebSocket; plain HTTP exists only for the private-network preflight a browser may send before
// A page on `https` reaches a loopback address, and for a second host's probe, answered with its challenge signed and
// No CORS headers. Anything else is refused with nothing a stranger's page could read, so a page on another site
// Cannot even learn that a host is running here
export const answerHttpRequest = (
  { headers, method }: IncomingMessage,
  response: ServerResponse,
  token: string,
): void => {
  const challenge = headers[HOST_CHALLENGE_HEADER];
  if (method === "GET" && typeof challenge === "string") {
    response.writeHead(200).end(getHostProof(challenge, token));
    return;
  }

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
