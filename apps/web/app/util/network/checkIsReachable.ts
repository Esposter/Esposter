import { getResultAsync } from "@esposter/shared";

// Whether the reader's own network reaches a URL within the time given. The request is made without reading its
// Response, so it answers for any origin and any status; a network that blocks the host fails it or never answers,
// And either is a no. It skips the HTTP cache, where a response from an earlier network would answer for this one
export const checkIsReachable = (url: string, timeout: Temporal.Duration): Promise<boolean> =>
  getResultAsync(() =>
    fetch(url, { cache: "no-store", mode: "no-cors", signal: AbortSignal.timeout(timeout.total("milliseconds")) }),
  ).match(
    () => true,
    () => false,
  );
