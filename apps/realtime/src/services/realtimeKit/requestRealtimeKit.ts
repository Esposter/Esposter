import type { RealtimeKitCredentials } from "#src/models/realtimeKit/RealtimeKitCredentials";

import { HttpMethod } from "#src/models/realtimeKit/HttpMethod";
import { REALTIMEKIT_API_ORIGIN } from "#src/services/realtimeKit/constants";
import { CLOUDFLARE_ACCOUNT_ID } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

// Every RealtimeKit REST call goes through here: the account's API token, and the reply's
// `data` checked against the caller's schema.
// A reply that is not what the caller reads fails the call rather than being read as if it were
export const requestRealtimeKit = async <Schema extends z.ZodType>(
  { apiToken, appId }: RealtimeKitCredentials,
  { body, method, path, schema }: { body: unknown; method: HttpMethod; path: string; schema: Schema },
): Promise<z.output<Schema>> => {
  const response = await fetch(
    `${REALTIMEKIT_API_ORIGIN}/accounts/${CLOUDFLARE_ACCOUNT_ID}/realtime/kit/${appId}${path}`,
    {
      body: JSON.stringify(body),
      headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": "application/json" },
      method,
    },
  );
  if (!response.ok)
    throw new InvalidOperationError(
      method === HttpMethod.Patch ? Operation.Update : Operation.Create,
      `RealtimeKit ${method} ${path}`,
      `responds ${response.status}`,
    );

  const { data } = z.object({ data: z.unknown() }).parse(await response.json());
  return schema.parse(data);
};
