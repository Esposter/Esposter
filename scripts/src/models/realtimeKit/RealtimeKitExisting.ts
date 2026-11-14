import type { RealtimeKitWebhook } from "#src/models/realtimeKit/RealtimeKitWebhook";

// What an environment's RealtimeKit already holds, and what ESC holds of the values the Workers read. A token's value is
// Never read back, only whether ESC holds one
export interface RealtimeKitExisting {
  app?: { id: string; name: string };
  escAppId?: string;
  isEscTokenSet: boolean;
  presets: { id: string; name: string }[];
  token?: { id: string; name: string };
  webhooks: RealtimeKitWebhook[];
}
