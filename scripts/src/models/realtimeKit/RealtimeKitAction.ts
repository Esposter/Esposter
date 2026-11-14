import type { RealtimeKitPreset } from "#src/models/realtimeKit/RealtimeKitPreset";

// One change the provisioning makes, in the order it makes them. Each names only what it acts on: the app, preset, webhook
// and token it takes its name or url from the desired state the plan was made against
export type RealtimeKitAction =
  | { kind: "createApp" }
  | { kind: "createPreset"; preset: RealtimeKitPreset }
  | { kind: "createToken" }
  | { kind: "createWebhook" }
  | { kind: "rollToken"; id: string }
  | { kind: "setAppId" }
  | { kind: "updateWebhook"; id: string };
