import type { Device } from "#shared/models/auth/Device";

import { useWebPubSubServiceClient } from "@@/server/composables/azure/webPubSub/useWebPubSubServiceClient";
import { getDeviceId } from "@@/server/services/auth/getDeviceId";
import { AzureWebPubSubHub } from "@esposter/db-schema";
import { getResultAsync, noop } from "@esposter/shared";

// A client access url outlives the session that minted it, so a revoked session keeps its live connections
// Until they are closed here. Web PubSub identifies a connection by device rather than by user
// (see generateWebPubSubClientAccessUrl), so this closes exactly one session's connections.
// Best-effort in full, the client included: the revoke this follows has already landed, so a hub that cannot be
// Reached costs a connection that lives until it drops on its own rather than a revoke reported as failed
export const closeDeviceConnections = async (device: Device): Promise<void> => {
  await getResultAsync(() => {
    const webPubSubServiceClient = useWebPubSubServiceClient(AzureWebPubSubHub.Messages);
    return webPubSubServiceClient.closeUserConnections(getDeviceId(device));
  }).match(noop, console.error);
};
