import { getResultAsync, InvalidOperationError, Operation } from "@esposter/shared";
import type { AwsClient } from "aws4fetch";

// Sends one signed request. A request that cannot reach R2 throws naming the object it was for, so a failure among the
// copies that run together says which one it was
export const sendR2Request = (
  client: AwsClient,
  operation: Operation,
  name: string,
  url: URL,
  init: RequestInit,
): Promise<Response> =>
  getResultAsync(() => client.fetch(url.toString(), init)).match(
    (response) => response,
    (error) => {
      throw new InvalidOperationError(operation, name, `could not reach R2: ${error.message}`);
    },
  );
