import type { RealtimeKitCredentials } from "#src/models/realtimeKit/RealtimeKitCredentials";

// RealtimeKit is optional — a deployment without it runs calls with no media server rather than failing them — so
// every entry point asks this first, and asking it in one place keeps a token from being minted for a meeting the
// REST client was never configured to create
export const getRealtimeKitCredentials = (): RealtimeKitCredentials | undefined => {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.REALTIMEKIT_API_TOKEN;
  const appId = process.env.REALTIMEKIT_APP_ID;
  if (!accountId || !apiToken || !appId) return undefined;
  else return { accountId, apiToken, appId };
};
