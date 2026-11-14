import type { RealtimeKitPreset } from "#src/models/realtimeKit/RealtimeKitPreset";

import { CloudflareEnvironment } from "@esposter/db-schema";

// The origin each environment's web Worker is served under. The webhook is subscribed under it, at the route the calls
// Code answers
export const WEB_ORIGIN_MAP: Readonly<Record<CloudflareEnvironment, string>> = {
  [CloudflareEnvironment.Development]: "https://dev.esposter.com",
  [CloudflareEnvironment.Production]: "https://esposter.com",
};
export const REALTIMEKIT_WEBHOOK_PATH = "/api/webhooks/realtimekit";
// The two events the webhook route is subscribed to. RealtimeKit delivers no other to it
export const REALTIMEKIT_WEBHOOK_EVENTS: string[] = ["meeting.participantJoined", "meeting.participantLeft"];
// The four presets the calls code joins a participant with, named as its REALTIMEKIT_PRESET_NAME names them
// (apps/web/server/services/realtimeKit/constants.ts). A preset is created only when it is missing, so a change to one of
// These is made by hand in RealtimeKit and not here
export const REALTIMEKIT_PRESETS: RealtimeKitPreset[] = [
  { isMicrophoneAllowed: false, isScreenshareAllowed: false, name: "esposter-camera" },
  { isMicrophoneAllowed: true, isScreenshareAllowed: false, name: "esposter-camera-microphone" },
  { isMicrophoneAllowed: true, isScreenshareAllowed: true, name: "esposter-camera-microphone-screenshare" },
  { isMicrophoneAllowed: false, isScreenshareAllowed: true, name: "esposter-camera-screenshare" },
];
// The dashboard's name for the permission group the token is granted, which the RealtimeKit REST API accepts. The name is
// Looked up before any write, so a dry run confirms it against the account
export const REALTIMEKIT_TOKEN_PERMISSION_GROUP_NAME = "Realtime Admin";
export const CLOUDFLARE_API_ORIGIN = "https://api.cloudflare.com/client/v4";
// Both environments' values sit in one ESC environment, under a key per environment (`dev_` and `prod_`), which the
// Deploy job reads the same way
export const ESC_ENVIRONMENT_NAME = "esposter-infra/prod";
export const ESC_KEY_PREFIX = "pulumiConfig.esposter-infra:";
export const JSON_CONTENT_TYPE = "application/json";
export const REQUEST_TIMEOUT_MS: number = Temporal.Duration.from({ seconds: 30 }).total("milliseconds");
