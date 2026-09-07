interface LiveKitCredentials {
  apiKey: string;
  apiSecret: string;
  url: string;
}
// LiveKit is optional — a deployment without it runs calls with no media server rather than failing them — so
// Every entry point has to answer the same question first, and answering it in one place is what keeps the
// Token path from minting a grant for a room the service client was never configured to create
export const getLiveKitCredentials = (): LiveKitCredentials | undefined => {
  const { livekit } = useRuntimeConfig();
  if (!livekit?.url || !livekit.apiKey || !livekit.apiSecret) return undefined;
  return { apiKey: livekit.apiKey, apiSecret: livekit.apiSecret, url: livekit.url };
};
