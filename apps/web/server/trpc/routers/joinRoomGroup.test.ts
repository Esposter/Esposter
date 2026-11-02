import type { Context } from "#server/trpc/context";

import { useWebPubSubServiceClient } from "#server/composables/azure/webPubSub/useWebPubSubServiceClient";
import { readUserDeviceIds } from "#server/services/auth/readUserDeviceIds";
import { AzureWebPubSubHub } from "@esposter/db-schema";
import { describe } from "vitest";

// A member's connections are in the room's group from the moment they connect, through the `groups` claim of the token
// Minted for them, so every device the member holds is added
export const joinRoomGroup = async (db: Context["db"], roomId: string, userId: string) => {
  const roomGroup = useWebPubSubServiceClient(AzureWebPubSubHub.Messages).group(roomId);
  await Promise.all((await readUserDeviceIds(db, userId)).map((deviceId) => roomGroup.addUser(deviceId)));
};

describe.todo("joinRoomGroup");
