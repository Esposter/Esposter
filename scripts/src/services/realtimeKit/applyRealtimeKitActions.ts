import type { CloudflareCredentials } from "#src/models/realtimeKit/CloudflareCredentials";
import type { RealtimeKitAction } from "#src/models/realtimeKit/RealtimeKitAction";
import type { RealtimeKitDesired } from "#src/models/realtimeKit/RealtimeKitDesired";
import type { RealtimeKitExisting } from "#src/models/realtimeKit/RealtimeKitExisting";
import type { CloudflareEnvironment } from "@esposter/db-schema";

import { getEscKey } from "#src/services/realtimeKit/getEscKey";
import { getRealtimeKitPresetBody } from "#src/services/realtimeKit/getRealtimeKitPresetBody";
import { requestCloudflare } from "#src/services/realtimeKit/requestCloudflare";
import { setEscValue } from "#src/services/realtimeKit/setEscValue";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

const successSchema = z.object({ success: z.literal(true) });

// Makes each change in order, against RealtimeKit's REST API and Cloudflare's token API. A token's value is written to
// ESC the moment it is made or rolled, since a value not written is lost: a run that stops after it is then repaired by
// The next run, which finds the token and no value for it, and rolls it
export const applyRealtimeKitActions = async (
  credentials: CloudflareCredentials,
  environment: CloudflareEnvironment,
  desired: RealtimeKitDesired,
  permissionGroupId: string,
  existing: RealtimeKitExisting,
  actions: RealtimeKitAction[],
): Promise<void> => {
  let appId = existing.app?.id;
  // The app is created by the first action when it is missing, so anything that names it reads the id once that exists
  const requireAppId = (): string => {
    if (appId === undefined)
      throw new InvalidOperationError(Operation.Read, desired.appName, "has no app id to act on yet");
    return appId;
  };

  for (const action of actions) {
    switch (action.kind) {
      case "createApp": {
        const { data } = await requestCloudflare(credentials, {
          body: { name: desired.appName },
          method: "POST",
          path: "/realtime/kit/apps",
          schema: z.object({ data: z.object({ app: z.object({ id: z.string() }) }) }),
        });
        appId = data.app.id;
        break;
      }
      case "createPreset":
        await requestCloudflare(credentials, {
          body: getRealtimeKitPresetBody(action.preset),
          method: "POST",
          path: `/realtime/kit/${requireAppId()}/presets`,
          schema: successSchema,
        });
        break;
      case "createToken": {
        const { result } = await requestCloudflare(credentials, {
          body: {
            name: desired.tokenName,
            policies: [
              {
                effect: "allow",
                permission_groups: [{ id: permissionGroupId }],
                resources: { [`com.cloudflare.api.account.${credentials.accountId}`]: "*" },
              },
            ],
          },
          method: "POST",
          path: "/tokens",
          schema: z.object({ result: z.object({ value: z.string() }) }),
        });
        await setEscValue(getEscKey(environment, "REALTIMEKIT_API_TOKEN"), result.value);
        break;
      }
      case "createWebhook":
        await requestCloudflare(credentials, {
          body: { enabled: true, events: desired.webhookEvents, name: desired.appName, url: desired.webhookUrl },
          method: "POST",
          path: `/realtime/kit/${requireAppId()}/webhooks`,
          schema: successSchema,
        });
        break;
      case "rollToken": {
        const { result } = await requestCloudflare(credentials, {
          method: "PUT",
          path: `/tokens/${action.id}/value`,
          schema: z.object({ result: z.string() }),
        });
        await setEscValue(getEscKey(environment, "REALTIMEKIT_API_TOKEN"), result);
        break;
      }
      case "setAppId":
        await setEscValue(getEscKey(environment, "REALTIMEKIT_APP_ID"), requireAppId());
        break;
      case "updateWebhook":
        await requestCloudflare(credentials, {
          body: { enabled: true, events: desired.webhookEvents, url: desired.webhookUrl },
          method: "PATCH",
          path: `/realtime/kit/${requireAppId()}/webhooks/${action.id}`,
          schema: successSchema,
        });
        break;
    }
  }
};
