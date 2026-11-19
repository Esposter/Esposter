export interface RealtimeKitWebhook {
  enabled: boolean;
  events: readonly string[];
  id: string;
  url: string;
}
