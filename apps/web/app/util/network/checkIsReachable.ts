import { getResultAsync } from "@esposter/shared";

// Whether the reader's own network reaches a URL within the time given. The request is made without reading its
// Response, so it answers for any origin and any status; a network that blocks the host fails it or never answers,
// And either is a no
export const checkIsReachable = (url: string, timeout: Temporal.Duration): Promise<boolean> =>
  getResultAsync(() =>
    fetch(url, { mode: "no-cors", signal: AbortSignal.timeout(timeout.total("milliseconds")) }),
  ).match(
    () => true,
    () => false,
  );
