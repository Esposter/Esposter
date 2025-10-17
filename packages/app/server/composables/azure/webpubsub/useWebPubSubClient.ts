import { useWebPubSubServiceClient } from "@@/server/composables/azure/webPubSub/useWebPubSubServiceClient";
import { WebPubSubClient } from "@azure/web-pubsub-client";
import { AzureWebPubSubHub } from "@esposter/db-schema";

export const useWebPubSubClient = async (groupIds: string[], signal?: AbortSignal) => {
  const webPubSubServiceClient = useWebPubSubServiceClient(AzureWebPubSubHub.Messages);
  const { url } = await webPubSubServiceClient.getClientAccessToken({
    roles: groupIds.map((groupId) => `webPubSub.joinLeaveGroup.${groupId}`),
  });
  const webPubSubClient = new WebPubSubClient(url);
  await webPubSubClient.start();
  await Promise.all(groupIds.map((groupId) => webPubSubClient.joinGroup(groupId)));
  signal?.addEventListener("abort", () => webPubSubClient.stop(), { once: true });
  return webPubSubClient;
};
