import type { R2Transport } from "#src/models/cloudflare/R2Transport";
import type { Operation } from "@esposter/shared";

import { R2_CONNECT_ATTEMPTS, R2_CONNECT_ERROR_CODES } from "#src/services/cutover/constants";
import { getResultAsync, InvalidOperationError } from "@esposter/shared";

const getCauseCode = (error: Error): string | undefined =>
  error.cause instanceof Error && "code" in error.cause && typeof error.cause.code === "string"
    ? error.cause.code
    : undefined;

// Sends one signed request. A request that never connected is sent again, a bounded number of times, unless its body is a
// Stream: the first send locked it, so a streamed upload is resent whole by its caller from a fresh read. Any other failure
// Throws naming the object it was for, so a failure among the copies that run together says which one it was
export const sendR2Request = async (
  transport: R2Transport,
  operation: Operation,
  name: string,
  url: URL,
  init: RequestInit,
  attempt = 1,
): Promise<Response> =>
  getResultAsync(() => transport.fetch(url.toString(), init)).match(
    (response) => response,
    (error) => {
      const code = getCauseCode(error);
      if (
        code !== undefined &&
        R2_CONNECT_ERROR_CODES.includes(code) &&
        !(init.body instanceof ReadableStream) &&
        attempt < R2_CONNECT_ATTEMPTS
      )
        return sendR2Request(transport, operation, name, url, init, attempt + 1);
      throw new InvalidOperationError(
        operation,
        name,
        `could not reach R2: ${error.message}${error.cause instanceof Error ? ` (${error.cause.message})` : ""}`,
      );
    },
  );
