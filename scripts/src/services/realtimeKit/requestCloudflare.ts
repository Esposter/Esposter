import type { CloudflareCredentials } from "#src/models/realtimeKit/CloudflareCredentials";
import type { z } from "zod";

import { RequestMethod } from "#src/models/realtimeKit/RequestMethod";
import { CLOUDFLARE_API_ORIGIN, JSON_CONTENT_TYPE, REQUEST_TIMEOUT_MS } from "#src/services/realtimeKit/constants";
import { fetchResponse } from "#src/services/shared/fetchResponse";
import { CLOUDFLARE_ACCOUNT_ID } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";

// The operation a refused request is named as, so the error reads as the write or the read it was
const METHOD_OPERATION_MAP: Record<RequestMethod, Operation> = {
  [RequestMethod.Get]: Operation.Read,
  [RequestMethod.Patch]: Operation.Update,
  [RequestMethod.Post]: Operation.Create,
  [RequestMethod.Put]: Operation.Update,
};

// Every Cloudflare call the provisioning makes, under the account's token. The reply is checked against the envelope the
// Caller reads, so a reply that is not what it reads fails the step. A refusal names the request and its status, never
// Its body, since a body can echo a token
export const requestCloudflare = async <Schema extends z.ZodType>(
  { apiToken }: CloudflareCredentials,
  { body, method, path, schema }: { body?: unknown; method: RequestMethod; path: string; schema: Schema },
): Promise<z.output<Schema>> => {
  const response = await fetchResponse(`${CLOUDFLARE_API_ORIGIN}/accounts/${CLOUDFLARE_ACCOUNT_ID}${path}`, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": JSON_CONTENT_TYPE },
    method,
    timeoutMs: REQUEST_TIMEOUT_MS,
  });
  if (!response.ok) throw new InvalidOperationError(METHOD_OPERATION_MAP[method], path, `responds ${response.status}`);
  return schema.parse(await response.json());
};
