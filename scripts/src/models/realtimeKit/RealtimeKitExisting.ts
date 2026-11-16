import type { RealtimeKitWebhook } from "#src/models/realtimeKit/RealtimeKitWebhook";

// What an environment's RealtimeKit already holds, and what ESC holds of the values the Workers read. A token's value is
// Never read back, only whether ESC holds one
export interface RealtimeKitExisting {
  app?: undefined | { id: string; name: string };
  escAppId?: string | undefined;
  isEscTokenSet: boolean;
  presets: { id: string; name: string }[];
  token?: undefined | { id: string; name: string };
  webhooks: RealtimeKitWebhook[];
}
