import type { RealtimeKitPreset } from "#src/models/realtimeKit/RealtimeKitPreset";

// What an environment's RealtimeKit must hold, each named as the naming function and the calls code name it
export interface RealtimeKitDesired {
  appName: string;
  presets: RealtimeKitPreset[];
  tokenName: string;
  webhookEvents: string[];
  webhookUrl: string;
}
