import type { LiveKitCredentials } from "#server/models/livekit/LiveKitCredentials";

// LiveKit is optional — a deployment without it runs calls with no media server rather than failing them — so
// Every entry point has to answer the same question first, and answering it in one place is what keeps the
// Token path from minting a grant for a room the service client was never configured to create
export const getLiveKitCredentials = (): LiveKitCredentials | undefined => {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const url = process.env.LIVEKIT_URL;
  if (!url || !apiKey || !apiSecret) return undefined;
  else return { apiKey, apiSecret, url };
};
