import type { RealtimeKitDesired } from "#src/models/realtimeKit/RealtimeKitDesired";
import type { CloudflareEnvironment } from "@esposter/db-schema";

import {
  REALTIMEKIT_PRESETS,
  REALTIMEKIT_WEBHOOK_EVENTS,
  REALTIMEKIT_WEBHOOK_PATH,
  WEB_ORIGIN_MAP,
} from "#src/services/realtimeKit/constants";
import { CloudflareAssetType, getCloudflareResourceName } from "@esposter/db-schema";

// What an environment's RealtimeKit must hold: the app and token named by the naming function, and the webhook at the
// Origin that environment's web Worker is served under
export const getRealtimeKitDesired = (environment: CloudflareEnvironment): RealtimeKitDesired => ({
  appName: getCloudflareResourceName(environment, CloudflareAssetType.RealtimeKitApp, "calls"),
  presets: REALTIMEKIT_PRESETS,
  tokenName: getCloudflareResourceName(environment, CloudflareAssetType.Token, "realtimekit"),
  webhookEvents: REALTIMEKIT_WEBHOOK_EVENTS,
  webhookUrl: `${WEB_ORIGIN_MAP[environment]}${REALTIMEKIT_WEBHOOK_PATH}`,
});
