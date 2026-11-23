import type { RealtimeKitPreset } from "#src/models/realtimeKit/RealtimeKitPreset";

// One change the provisioning makes, in the order it makes them. Each names only what it acts on:
// The app, preset and webhook, each taking its name or url from the desired state the plan was made against
export type RealtimeKitAction =
  | { id: string; kind: "updateWebhook" }
  | { kind: "createApp" }
  | { kind: "createPreset"; preset: RealtimeKitPreset }
  | { kind: "createWebhook" }
  | { kind: "setAppId" };
