/* oxlint-disable no-await-in-loop -- Retry: the next attempt is sent only because the one before it was refused */
import type { SigV4Credentials } from "#src/models/sigv4/SigV4Credentials";

import { SIGV4_FETCH_FIRST_RETRY_CEILING_MS, SIGV4_FETCH_RETRY_COUNT } from "#src/services/sigv4/constants";
import { signSigV4Request } from "#src/services/sigv4/signSigV4Request";
import { sleep } from "#src/util/time/sleep";

// A fetch that signs each request with the credentials. A 5xx or a 429 is sent again after a wait drawn at random below a
// Ceiling that doubles each time, each attempt signed afresh, and the last answer is returned whatever it is. A body
// That is a stream is spent by the first attempt, so a request carrying one is sent once
export const createSigV4Fetch =
  (
    credentials: SigV4Credentials,
    { retryCount = SIGV4_FETCH_RETRY_COUNT }: { retryCount?: number } = {},
  ): ((url: string | URL, init?: RequestInit) => Promise<Response>) =>
  async (url, init = {}) => {
    const method = init.method ?? "GET";
    const attemptCount = init.body instanceof ReadableStream ? 1 : retryCount + 1;
    for (let attempt = 0; ; attempt++) {
      const headers = await signSigV4Request(credentials, { headers: init.headers, method, url });
      const response = await fetch(url, { ...init, headers, method });
      if (attempt === attemptCount - 1 || (response.status < 500 && response.status !== 429)) return response;
      await response.body?.cancel();
      await sleep(Math.random() * SIGV4_FETCH_FIRST_RETRY_CEILING_MS * 2 ** attempt);
    }
  };
