import type { StreamTable, StreamTableEntityMap } from "@esposter/db-schema";
import type { StreamTableClient } from "@esposter/db";

import { SEED_DATE, SEED_MESSAGE_EPOCH_NANOSECONDS } from "#src/services/devSeed/constants";
import { addMessageMetadata, serializeEntity } from "@esposter/db";
import { createMessageEntity, getReverseTickedTimestamp, MessageType } from "@esposter/db-schema";
import { DRIVEN_USER_ID, ZERO_UUID } from "@esposter/shared";

// The room's one message, from the driven user, under a fixed row key so a rerun replaces it rather than adding a copy.
export const writeSeedMessages = async (
  messageClient: StreamTableClient<StreamTableEntityMap[StreamTable.Messages]>,
): Promise<void> => {
  const messageEntity = createMessageEntity({
    message: "message",
    roomId: ZERO_UUID,
    type: MessageType.Message,
    userId: DRIVEN_USER_ID,
  });
  messageEntity.createdAt = SEED_DATE;
  messageEntity.updatedAt = SEED_DATE;
  messageEntity.rowKey = getReverseTickedTimestamp(SEED_MESSAGE_EPOCH_NANOSECONDS);
  await addMessageMetadata(messageEntity);
  await messageClient.upsertEntity(serializeEntity(messageEntity), "Replace");
};
