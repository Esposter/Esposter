import type { RealtimeKitWebhook } from "#src/models/realtimeKit/RealtimeKitWebhook";

// What an environment's RealtimeKit already holds, and what ESC holds of the app id the Workers read
export interface RealtimeKitExisting {
  app?: { id: string; name: string } | undefined;
  escAppId?: string | undefined;
  presets: { id: string; name: string }[];
  webhooks: RealtimeKitWebhook[];
}
