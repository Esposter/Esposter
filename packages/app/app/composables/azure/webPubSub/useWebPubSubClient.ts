import type { OnGroupDataMessageArgs } from "@azure/web-pubsub-client";

import { WebPubSubClient } from "@azure/web-pubsub-client";

// A started client on one hub, and the stopper its subscriber owes back. Every hub is consumed the same way —
// Mint an access url through tRPC, start, listen for the one group the token joined — so what a caller brings
// Is the url it mints and what it does with a message, and never the lifecycle around them.
export const useWebPubSubClient = async (
  getClientAccessUrl: (signal?: AbortSignal) => Promise<string>,
  onGroupMessage: (groupDataMessage: OnGroupDataMessageArgs) => void,
): Promise<() => void> => {
  const webPubSubClient = new WebPubSubClient({
    getClientAccessUrl: (options) => getClientAccessUrl(options?.abortSignal as AbortSignal | undefined),
  });
  // Registered before the client starts: a group message that arrives while `start` is still resolving is
  // Delivered to whatever is listening at that moment, and a subscriber that missed one waits for the next
  // Change to learn what it already changed
  webPubSubClient.on("group-message", onGroupMessage);
  await webPubSubClient.start();
  return () => {
    webPubSubClient.stop();
  };
};
