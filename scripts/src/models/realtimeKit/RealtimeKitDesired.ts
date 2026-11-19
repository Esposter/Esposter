import type { RealtimeKitPreset } from "#src/models/realtimeKit/RealtimeKitPreset";
import type { RealtimeKitWebhookEvent } from "@esposter/shared";

// What an environment's RealtimeKit must hold, each named as the naming function and the calls code name it
export interface RealtimeKitDesired {
  appName: string;
  presets: RealtimeKitPreset[];
  tokenName: string;
  webhookEvents: readonly RealtimeKitWebhookEvent[];
  webhookUrl: string;
}
