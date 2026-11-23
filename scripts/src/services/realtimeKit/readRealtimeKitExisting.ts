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
const webhookSchema = z.object({ enabled: z.boolean(), events: z.array(z.string()), id: z.string(), url: z.string() });

// What the environment's app, presets and webhook already are, and what ESC holds of the app id the Workers read. Every
// Listing asks for a page large enough for the few items an environment holds
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
  const escAppId = await readEscValue(getEscKey(environment, "REALTIMEKIT_APP_ID"));

  return { app, escAppId, presets, webhooks };
};
