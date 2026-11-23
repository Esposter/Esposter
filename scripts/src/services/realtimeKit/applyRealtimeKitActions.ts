import type { CloudflareCredentials } from "#src/models/realtimeKit/CloudflareCredentials";
import type { RealtimeKitAction } from "#src/models/realtimeKit/RealtimeKitAction";
import type { RealtimeKitDesired } from "#src/models/realtimeKit/RealtimeKitDesired";
import type { RealtimeKitExisting } from "#src/models/realtimeKit/RealtimeKitExisting";
import type { CloudflareEnvironment } from "@esposter/db-schema";

import { RequestMethod } from "#src/models/realtimeKit/RequestMethod";
import { getEscKey } from "#src/services/realtimeKit/getEscKey";
import { getRealtimeKitPresetBody } from "#src/services/realtimeKit/getRealtimeKitPresetBody";
import { requestCloudflare } from "#src/services/realtimeKit/requestCloudflare";
import { setEscValue } from "#src/services/realtimeKit/setEscValue";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { z } from "zod";

const successSchema = z.object({ success: z.literal(true) });

// Makes each change in order, against RealtimeKit's REST API. The app id is written to ESC as soon as it is known
export const applyRealtimeKitActions = async (
  credentials: CloudflareCredentials,
  environment: CloudflareEnvironment,
  desired: RealtimeKitDesired,
  existingState: RealtimeKitExisting,
  actions: RealtimeKitAction[],
): Promise<void> => {
  let appId = existingState.app?.id;
  // The app is created by the first action when it is missing, so anything that names it reads the id once that exists
  const requireAppId = (): string => {
    if (appId === undefined)
      throw new InvalidOperationError(Operation.Read, desired.appName, "has no app id to act on yet");
    return appId;
  };

  // @TODO: no upstream issue — oxc-project/oxc: no-await-in-loop skips an await under a loop body that is a bare `if` or
  // `switch`; the reason below turns back into the rule's directive once it reports here
  // Each step reads the last: createPreset and createWebhook need the app id createApp returned, and the app id
  // Reaches ESC before the next step reads it
  for (const action of actions)
    switch (action.kind) {
      case "createApp": {
        const { data } = await requestCloudflare(credentials, {
          body: { name: desired.appName },
          method: RequestMethod.Post,
          path: "/realtime/kit/apps",
          schema: z.object({ data: z.object({ app: z.object({ id: z.string() }) }) }),
        });
        appId = data.app.id;
        break;
      }
      case "createPreset":
        await requestCloudflare(credentials, {
          body: getRealtimeKitPresetBody(action.preset),
          method: RequestMethod.Post,
          path: `/realtime/kit/${requireAppId()}/presets`,
          schema: successSchema,
        });
        break;
      case "createWebhook":
        await requestCloudflare(credentials, {
          body: { enabled: true, events: desired.webhookEvents, name: desired.appName, url: desired.webhookUrl },
          method: RequestMethod.Post,
          path: `/realtime/kit/${requireAppId()}/webhooks`,
          schema: successSchema,
        });
        break;
      case "setAppId":
        await setEscValue(getEscKey(environment, "REALTIMEKIT_APP_ID"), requireAppId());
        break;
      case "updateWebhook":
        await requestCloudflare(credentials, {
          body: { enabled: true, events: desired.webhookEvents, url: desired.webhookUrl },
          method: RequestMethod.Patch,
          path: `/realtime/kit/${requireAppId()}/webhooks/${action.id}`,
          schema: successSchema,
        });
        break;
      default:
        throw new InvalidOperationError(
          Operation.Update,
          desired.appName,
          `has an unknown action ${JSON.stringify(action)}`,
        );
    }
};
