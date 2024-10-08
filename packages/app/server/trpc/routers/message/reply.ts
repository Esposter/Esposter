import type { CustomTableClient } from "@/models/azure/table";

import { selectRoomSchema } from "@/db/schema/rooms";
import { AzureTable } from "@/models/azure/table";
import { MessageMetadataType } from "@/models/esbabbler/message/metadata";
import {
  MessageReplyMetadataEntity,
  MessageReplyMetadataEntityPropertyNames,
  messageReplyMetadataSchema,
} from "@/models/esbabbler/message/reply";
import { router } from "@/server/trpc";
import { getRoomUserProcedure } from "@/server/trpc/procedure";
import { readMetadataInputSchema } from "@/server/trpc/routers/message";
import { AZURE_MAX_PAGE_SIZE } from "@/services/azure/constants";
import { createEntity, getTableClient, getTopNEntities } from "@/services/azure/table";
import { replyEventEmitter } from "@/services/esbabbler/events/reply";
import { getMessagesPartitionKeyFilter } from "@/services/esbabbler/table";
import { now } from "@/util/time/now";
import { observable } from "@trpc/server/observable";
import { z } from "zod";

const onCreateReplyInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnCreateReplyInput = z.infer<typeof onCreateReplyInputSchema>;

const createReplyInputSchema = messageReplyMetadataSchema.pick({
  messageReplyRowKey: true,
  messageRowKey: true,
  partitionKey: true,
  rowKey: true,
});
export type CreateReplyInput = z.infer<typeof createReplyInputSchema>;

export const replyRouter = router({
  createReply: getRoomUserProcedure(createReplyInputSchema, "partitionKey")
    .input(createReplyInputSchema)
    .mutation(async ({ input }) => {
      const messagesMetadataClient = await getTableClient(AzureTable.MessagesMetadata);
      const { messageReplyRowKey, messageRowKey, type } = MessageReplyMetadataEntityPropertyNames;
      const replies = await getTopNEntities(messagesMetadataClient, 1, MessageReplyMetadataEntity, {
        filter: `PartitionKey eq '${input.partitionKey}' and ${type} eq '${MessageMetadataType.Reply}' and ${messageRowKey} eq '${input.messageRowKey}' and ${messageReplyRowKey} eq '${input.messageReplyRowKey}'`,
      });
      if (replies.length > 0) return null;

      const createdAt = new Date();
      const newReply = new MessageReplyMetadataEntity({
        createdAt,
        messageReplyRowKey: input.messageReplyRowKey,
        messageRowKey: input.messageRowKey,
        partitionKey: input.partitionKey,
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
    .subscription(({ input }) =>
      observable<MessageReplyMetadataEntity>((emit) => {
        const onCreateReply = (data: MessageReplyMetadataEntity) => () => {
          if (data.partitionKey.startsWith(input.roomId)) emit.next(data);
        };
        replyEventEmitter.on("createReply", onCreateReply);
        return () => replyEventEmitter.off("createReply", onCreateReply);
      }),
    ),
  readReplies: getRoomUserProcedure(readMetadataInputSchema, "roomId")
    .input(readMetadataInputSchema)
    .query(async ({ input: { messageRowKeys, roomId } }) => {
      const messagesMetadataClient = (await getTableClient(
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
