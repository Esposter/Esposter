import type { RealtimeKitCredentials } from "#server/models/realtimeKit/RealtimeKitCredentials";

import { REALTIMEKIT_API_ORIGIN } from "#server/services/realtimeKit/constants";
import { MimeType } from "#shared/models/file/MimeType";
import { z } from "zod";

// Every RealtimeKit REST call goes through here: the account's API token, and the reply's `data` checked against the
// caller's schema, since a reply that is not what the caller reads fails the call rather than being read as if it were
export const requestRealtimeKit = async <Schema extends z.ZodType>(
  { accountId, apiToken, appId }: RealtimeKitCredentials,
  { body, method, path, schema }: { body: unknown; method: "PATCH" | "POST"; path: string; schema: Schema },
): Promise<z.output<Schema>> => {
  const response = await fetch(`${REALTIMEKIT_API_ORIGIN}/accounts/${accountId}/realtime/kit/${appId}${path}`, {
    body: JSON.stringify(body),
    headers: { Authorization: `Bearer ${apiToken}`, "Content-Type": MimeType.Json },
    method,
  });
  if (!response.ok) throw new Error(`RealtimeKit ${method} ${path} failed with ${response.status}`);

  const { data } = z.object({ data: schema }).parse(await response.json());
  return data;
};
