import type { CloudflareCredentials } from "#src/models/realtimeKit/CloudflareCredentials";
import type { RealtimeKitDesired } from "#src/models/realtimeKit/RealtimeKitDesired";
import type { RealtimeKitExisting } from "#src/models/realtimeKit/RealtimeKitExisting";
import type { CloudflareEnvironment } from "@esposter/db-schema";

import { RequestMethod } from "#src/models/realtimeKit/RequestMethod";
import { getEscKey } from "#src/services/realtimeKit/getEscKey";
import { readEscValue } from "#src/services/realtimeKit/readEscValue";
import { requestCloudflare } from "#src/services/realtimeKit/requestCloudflare";
import { z } from "zod";

const appSchema = z.object({ id: z.string(), name: z.string() });
const presetSchema = z.object({ id: z.string(), name: z.string() });
const tokenSchema = z.object({ id: z.string(), name: z.string() });
const webhookSchema = z.object({ enabled: z.boolean(), events: z.array(z.string()), id: z.string(), url: z.string() });

// What the environment's app, presets, webhook and token already are, and what ESC holds of the two values the Workers
// Read. A token's value is never read back, only whether ESC holds one. Every listing asks for a page large enough for
// The few items an environment holds
export const readRealtimeKitExisting = async (
  credentials: CloudflareCredentials,
  environment: CloudflareEnvironment,
  desired: RealtimeKitDesired,
): Promise<RealtimeKitExisting> => {
  const { data: apps } = await requestCloudflare(credentials, {
    method: RequestMethod.Get,
    path: "/realtime/kit/apps?per_page=100",
    schema: z.object({ data: z.array(appSchema) }),
  });
  const app = apps.find(({ name }) => name === desired.appName);
  const presets =
    app === undefined
      ? []
      : (
          await requestCloudflare(credentials, {
            method: RequestMethod.Get,
            path: `/realtime/kit/${app.id}/presets?per_page=100`,
            schema: z.object({ data: z.array(presetSchema) }),
          })
        ).data;
  const webhooks =
    app === undefined
      ? []
      : (
          await requestCloudflare(credentials, {
            method: RequestMethod.Get,
            path: `/realtime/kit/${app.id}/webhooks`,
            schema: z.object({ data: z.array(webhookSchema) }),
          })
        ).data;
  const { result: tokens } = await requestCloudflare(credentials, {
    method: RequestMethod.Get,
    path: "/tokens?per_page=100",
    schema: z.object({ result: z.array(tokenSchema) }),
  });
  const token = tokens.find(({ name }) => name === desired.tokenName);
  const escAppId = await readEscValue(getEscKey(environment, "REALTIMEKIT_APP_ID"));
  const escToken = await readEscValue(getEscKey(environment, "REALTIMEKIT_API_TOKEN"));

  return { app, escAppId, isEscTokenSet: escToken !== undefined, presets, token, webhooks };
};
