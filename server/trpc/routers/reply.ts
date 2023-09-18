import { selectRoomSchema } from "@/db/schema/rooms";
import { AzureTable, type CustomTableClient } from "@/models/azure/table";
import { replyEventEmitter } from "@/models/esbabbler/events/reply";
import { MessageMetadataType } from "@/models/esbabbler/message/metadata";
import { MessageReplyMetadataEntity, messageReplyMetadataSchema } from "@/models/esbabbler/message/reply";
import { router } from "@/server/trpc";
import { getRoomUserProcedure } from "@/server/trpc/procedure";
import { readMetadataInputSchema } from "@/server/trpc/routers/message";
import { AZURE_MAX_PAGE_SIZE, createEntity, getTableClient, getTopNEntities } from "@/services/azure/table";
import { getMessagesPartitionKeyFilter } from "@/services/esbabbler/table";
import { now } from "@/util/time";
import { odata } from "@azure/data-tables";
import { observable } from "@trpc/server/observable";
import { z } from "zod";

const onCreateReplyInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnCreateReplyInput = z.infer<typeof onCreateReplyInputSchema>;

const createReplyInputSchema = messageReplyMetadataSchema.pick({
  partitionKey: true,
  rowKey: true,
  messageRowKey: true,
  messageReplyRowKey: true,
});
export type CreateReplyInput = z.infer<typeof createReplyInputSchema>;

export const replyRouter = router({
  readReplies: getRoomUserProcedure(readMetadataInputSchema, "roomId")
    .input(readMetadataInputSchema)
    .query(async ({ input: { roomId, messages } }) => {
      const messagesMetadataClient = (await getTableClient(
        AzureTable.MessagesMetadata,
      )) as CustomTableClient<MessageReplyMetadataEntity>;
      return getTopNEntities(messagesMetadataClient, AZURE_MAX_PAGE_SIZE, MessageReplyMetadataEntity, {
        filter: `${getMessagesPartitionKeyFilter(roomId)} and type eq '${MessageMetadataType.Reply}' and (${messages
          .map((m) => `messageRowKey eq '${m.rowKey}'`)
          .join(" or ")})`,
      });
    }),
  onCreateReply: getRoomUserProcedure(onCreateReplyInputSchema, "roomId")
    .input(onCreateReplyInputSchema)
    .subscription(({ input }) =>
      observable<MessageReplyMetadataEntity>((emit) => {
        const onCreateReply = (data: MessageReplyMetadataEntity) => () => {
          if (data.partitionKey.startsWith(input.roomId)) emit.next(data);
        };
        replyEventEmitter.on("onCreateReply", onCreateReply);
        return () => replyEventEmitter.off("onCreateReply", onCreateReply);
      }),
    ),
  createReply: getRoomUserProcedure(createReplyInputSchema, "partitionKey")
    .input(createReplyInputSchema)
    .mutation(async ({ input }) => {
      const messagesMetadataClient = await getTableClient(AzureTable.MessagesMetadata);
      const replies = await getTopNEntities(messagesMetadataClient, 1, MessageReplyMetadataEntity, {
        filter: odata`PartitionKey eq ${input.partitionKey} and type eq ${MessageMetadataType.Reply} and messageRowKey eq ${input.messageRowKey} and messageReplyRowKey eq ${input.messageReplyRowKey}`,
      });
      if (replies.length > 0) return null;

      const createdAt = new Date();
      const newReply = new MessageReplyMetadataEntity({
        partitionKey: input.partitionKey,
        rowKey: now(),
        messageRowKey: input.messageRowKey,
        type: MessageMetadataType.Reply,
        messageReplyRowKey: input.messageReplyRowKey,
        createdAt,
        updatedAt: createdAt,
      });
      await createEntity(messagesMetadataClient, newReply);
      replyEventEmitter.emit("onCreateReply", newReply);
      return newReply;
    }),
});
