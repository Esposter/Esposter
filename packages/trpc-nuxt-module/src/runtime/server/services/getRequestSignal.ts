import type { H3Event } from "h3";

// Aborted when the response closes before it finished, which is the client going away. The response and not the
// Request, because node closes a request as soon as its body has been read, long before a streamed subscription ends
export const getRequestSignal = (event: H3Event): AbortSignal => {
  const abortController = new AbortController();
  const { res } = event.node;
  res.once("close", () => {
    if (!res.writableFinished) abortController.abort();
  });
  return abortController.signal;
};
