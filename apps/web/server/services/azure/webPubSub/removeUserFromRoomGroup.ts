import type { Context } from "#server/trpc/context";

import { useWebPubSubServiceClient } from "#server/composables/azure/webPubSub/useWebPubSubServiceClient";
import { readUserDeviceIds } from "#server/services/auth/readUserDeviceIds";
import { AzureWebPubSubHub } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";

// A room's messages reach its group, and a connection is in the group only while it is a member: the token's `groups`
// Claim put it there and nothing takes it out, so a departed member's open connections would keep receiving the room.
// Connections are identified by device (see generateWebPubSubClientAccessUrl), so every device the member holds comes
// Out. Best-effort, as closeDeviceConnections is: the departure has already committed, so a hub that cannot be reached
// Leaves a connection in the group rather than failing a removal that landed. The Result is handed back rather than
// Logged here, so each caller terminates it and the notify that follows it is the one the lint reads
export const removeUserFromRoomGroup = (db: Context["db"], roomId: string, userId: string) =>
  getResultAsync(async () => {
    const deviceIds = await readUserDeviceIds(db, userId);
    const roomGroup = useWebPubSubServiceClient(AzureWebPubSubHub.Messages).group(roomId);
    await Promise.all(deviceIds.map((deviceId) => roomGroup.removeUser(deviceId)));
  });
