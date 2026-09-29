import type { H3Event, HTTPMethod } from "h3";

import { getRequestSignal } from "#src/runtime/server/services/getRequestSignal";
import { getRequestHost, getRequestProtocol, isMethod, readRawBody } from "h3";

// The methods h3 reads a body for, which asserts on any other
const PAYLOAD_METHODS: HTTPMethod[] = ["DELETE", "PATCH", "POST", "PUT"];
// The body is the raw one h3 caches on the event rather than the request stream, so a middleware that read the body
// First has left it to be read again instead of draining it. The path is the one Nitro routed on, below any app base
// Url, since tRPC reads the procedure off whatever follows the endpoint in it
export const toRequest = async (event: H3Event): Promise<Request> => {
  const body = isMethod(event, PAYLOAD_METHODS) ? await readRawBody(event, false) : undefined;
  return new Request(`${getRequestProtocol(event)}://${getRequestHost(event)}${event.path}`, {
    // A buffer may be a view over a larger shared pool, which a fetch body refuses, so its bytes are copied out
    body: body && new Uint8Array(body),
    headers: event.headers,
    method: event.method,
    signal: getRequestSignal(event),
  });
};
