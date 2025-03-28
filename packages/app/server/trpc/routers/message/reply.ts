import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";

import { selectRoomSchema } from "#shared/db/schema/rooms";
import { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";
import {
  MessageReplyMetadataEntity,
  MessageReplyMetadataEntityPropertyNames,
  messageReplyMetadataEntitySchema,
} from "#shared/models/db/message/metadata/MessageReplyMetadataEntity";
import { now } from "#shared/util/time/now";
import { useTableClient } from "@@/server/composables/azure/useTableClient";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { AZURE_MAX_PAGE_SIZE } from "@@/server/services/azure/table/constants";
import { createEntity } from "@@/server/services/azure/table/createEntity";
import { getTopNEntities } from "@@/server/services/azure/table/getTopNEntities";
import { replyEventEmitter } from "@@/server/services/esbabbler/events/replyEventEmitter";
import { getMessagesPartitionKeyFilter } from "@@/server/services/esbabbler/getMessagesPartitionKeyFilter";
import { isMessagesPartitionKeyForRoomId } from "@@/server/services/esbabbler/isMessagesPartitionKeyForRoomId";
import { on } from "@@/server/services/events/on";
import { router } from "@@/server/trpc";
import { getProfanityFilterMiddleware } from "@@/server/trpc/middleware/getProfanityFilterMiddleware";
import { getRoomUserProcedure } from "@@/server/trpc/procedure/getRoomUserProcedure";
import { readMetadataInputSchema } from "@@/server/trpc/routers/message";
import { z } from "zod";

const onCreateReplyInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnCreateReplyInput = z.infer<typeof onCreateReplyInputSchema>;

const createReplyInputSchema = messageReplyMetadataEntitySchema.pick({
  message: true,
  messageRowKey: true,
  partitionKey: true,
});
export type CreateReplyInput = z.infer<typeof createReplyInputSchema>;

export const replyRouter = router({
  createReply: getRoomUserProcedure(createReplyInputSchema, "partitionKey")
    .use(getProfanityFilterMiddleware(createReplyInputSchema, ["message"]))
    .input(createReplyInputSchema)
    .mutation<MessageReplyMetadataEntity>(async ({ input }) => {
      const messagesMetadataClient = await useTableClient(AzureTable.MessagesMetadata);
      const createdAt = new Date();
      const newReply = new MessageReplyMetadataEntity({
        ...input,
        createdAt,
        rowKey: now(),
        type: MessageMetadataType.Reply,
        updatedAt: createdAt,
      });
      await createEntity(messagesMetadataClient, newReply);
      replyEventEmitter.emit("createReply", newReply);
      return newReply;
    }),
  onCreateReply: getRoomUserProcedure(onCreateReplyInputSchema, "roomId")
    .input(onCreateReplyInputSchema)
    .subscription(async function* ({ input, signal }) {
      for await (const [data] of on(replyEventEmitter, "createReply", { signal }))
        if (isMessagesPartitionKeyForRoomId(data.partitionKey, input.roomId)) yield data;
    }),
  readReplies: getRoomUserProcedure(readMetadataInputSchema, "roomId")
    .input(readMetadataInputSchema)
    .query(async ({ input: { messageRowKeys, roomId } }) => {
      const messagesMetadataClient = (await useTableClient(
        AzureTable.MessagesMetadata,
      )) as CustomTableClient<MessageReplyMetadataEntity>;
      const { messageRowKey, type } = MessageReplyMetadataEntityPropertyNames;
      return getTopNEntities(messagesMetadataClient, AZURE_MAX_PAGE_SIZE, MessageReplyMetadataEntity, {
        filter: `${getMessagesPartitionKeyFilter(roomId)} and ${type} eq '${
          MessageMetadataType.Reply
        }' and (${messageRowKeys.map((mrk) => `${messageRowKey} eq '${mrk}'`).join(" or ")})`,
      });
    }),
});
