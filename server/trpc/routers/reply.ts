import { MessageMetadataType } from "@/models/azure/message/metadata";
import { MessageReplyMetadataEntity, messageReplyMetadataSchema } from "@/models/azure/message/reply";
import { AzureTable } from "@/models/azure/table";
import { replyEventEmitter } from "@/models/events/reply";
import { router } from "@/server/trpc";
import { getRoomUserProcedure } from "@/server/trpc/procedure";
import { readMetadataInputSchema } from "@/server/trpc/routers/message";
import { roomSchema } from "@/server/trpc/routers/room";
import { AZURE_MAX_PAGE_SIZE, createEntity, getTableClient, getTopNEntities } from "@/services/azure/table";
import { getMessagesPartitionKeyFilter } from "@/services/message/table";
import { now } from "@/utils/time";
import { odata } from "@azure/data-tables";
import { observable } from "@trpc/server/observable";
import { z } from "zod";

const onCreateReplyInputSchema = z.object({ roomId: roomSchema.shape.id });
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
      const client = await getTableClient(AzureTable.MessagesMetadata);
      return getTopNEntities(client, AZURE_MAX_PAGE_SIZE, MessageReplyMetadataEntity, {
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
      })
    ),
  createReply: getRoomUserProcedure(createReplyInputSchema, "partitionKey")
    .input(createReplyInputSchema)
    .mutation(async ({ input }) => {
      try {
        const client = await getTableClient(AzureTable.MessagesMetadata);
        const replies = await getTopNEntities(client, 1, MessageReplyMetadataEntity, {
          filter: odata`PartitionKey eq ${input.partitionKey} and type eq ${MessageMetadataType.Reply} and messageRowKey eq ${input.messageRowKey} and messageReplyRowKey eq ${input.messageReplyRowKey}`,
        });
        if (replies.length > 0) return null;

        const newReply: MessageReplyMetadataEntity = {
          partitionKey: input.partitionKey,
          rowKey: now(),
          messageRowKey: input.messageRowKey,
          type: MessageMetadataType.Reply,
          messageReplyRowKey: input.messageReplyRowKey,
        };
        await createEntity<MessageReplyMetadataEntity>(client, newReply);
        replyEventEmitter.emit("onCreateReply", newReply);
        return newReply;
      } catch {
        return null;
      }
    }),
});
