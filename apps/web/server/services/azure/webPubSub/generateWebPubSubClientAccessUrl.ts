import type { GetSessionPayload } from "#shared/models/auth/GetSessionPayload";
import type { AzureWebPubSubHub } from "@esposter/db-schema";

import { useWebPubSubServiceClient } from "@@/server/composables/azure/webPubSub/useWebPubSubServiceClient";
import { getDevice } from "@@/server/services/auth/getDevice";
import { getDeviceId } from "@@/server/services/auth/getDeviceId";

// A hub's client access token, in the one shape every hub takes it in: joined to a single group, allowed to
// Rejoin that group after a reconnect, and identified by the device rather than the account — the identity
// `closeDeviceConnections` closes one session by. What differs per hub is only which group addresses the
// Caller, so that is the argument rather than a second copy of the mint.
export const generateWebPubSubClientAccessUrl = async (
  azureWebPubSubHub: AzureWebPubSubHub,
  group: string,
  getSessionPayload: GetSessionPayload,
  signal?: AbortSignal,
): Promise<string> => {
  const webPubSubServiceClient = useWebPubSubServiceClient(azureWebPubSubHub);
  const { url } = await webPubSubServiceClient.getClientAccessToken({
    abortSignal: signal,
    groups: [group],
    roles: [`webPubSub.joinLeaveGroup.${group}`],
    userId: getDeviceId(getDevice(getSessionPayload)),
  });
  return url;
};
