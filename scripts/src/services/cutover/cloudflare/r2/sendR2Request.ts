import type { R2Transport } from "#src/models/cloudflare/R2Transport";
import type { Operation } from "@esposter/shared";

import { getResultAsync, InvalidOperationError } from "@esposter/shared";

// Sends one signed request. A request that cannot reach R2 throws naming the object it was for.
// A failure among the copies that run together then says which one it was
export const sendR2Request = (
  transport: R2Transport,
  operation: Operation,
  name: string,
  url: URL,
  init: RequestInit,
): Promise<Response> =>
  getResultAsync(() => transport.fetch(url.toString(), init)).match(
    (response) => response,
    (error) => {
      throw new InvalidOperationError(operation, name, `could not reach R2: ${error.message}`);
    },
  );
