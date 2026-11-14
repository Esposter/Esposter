import { FETCH_TIMEOUT_MS } from "#src/services/shared/constants";

interface FetchResponseOptions {
  body?: string;
  headers?: Record<string, string>;
  method?: string;
  timeoutMs?: number;
}

// Every request a script makes, bounded in one place: a fetch with no timeout hangs a release run on a registry that
// Stopped answering. A large download passes a longer bound, and a registry asking for a token takes it as a header. The
// Response comes back whatever its status, for a caller that reads one status as an answer rather than a refusal
export const fetchResponse = (
  url: string,
  { body, headers, method, timeoutMs = FETCH_TIMEOUT_MS }: FetchResponseOptions = {},
): Promise<Response> =>
  // oxlint-disable-next-line no-restricted-globals -- the one request of this tree, which the ban routes every other through
  fetch(url, { body, headers, method, signal: AbortSignal.timeout(timeoutMs) });
