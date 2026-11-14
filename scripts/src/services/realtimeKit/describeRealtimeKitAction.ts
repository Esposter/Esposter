import type { RealtimeKitAction } from "#src/models/realtimeKit/RealtimeKitAction";
import type { RealtimeKitDesired } from "#src/models/realtimeKit/RealtimeKitDesired";

// The line a run prints for one change, naming what it touches and never a value
export const describeRealtimeKitAction = (action: RealtimeKitAction, desired: RealtimeKitDesired): string => {
  switch (action.kind) {
    case "createApp":
      return `Create app ${desired.appName}`;
    case "createPreset":
      return `Create preset ${action.preset.name}`;
    case "createToken":
      return `Create token ${desired.tokenName} and write its value to ESC`;
    case "createWebhook":
      return `Create webhook ${desired.webhookUrl}`;
    case "rollToken":
      return `Roll token ${desired.tokenName} and write its value to ESC`;
    case "setAppId":
      return "Write the app id to ESC";
    case "updateWebhook":
      return `Update webhook ${desired.webhookUrl}`;
  }
};
