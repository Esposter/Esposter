import type { AzureEntity, AzureUpdateEntity } from "@/models/azure";
import { MessageEntity, messageSchema } from "@/models/azure/message";
import { AzureTable } from "@/models/azure/table";
import { router } from "@/server/trpc";
import { customEventEmitter } from "@/server/trpc/events";
import { getRoomUserProcedure } from "@/server/trpc/procedure";
import { getTableClient, getTopNEntities } from "@/services/azure/table";
import { getReverseTickedTimestamp } from "@/utils/azure";
import { FETCH_LIMIT, getNextCursor } from "@/utils/pagination";
import { odata } from "@azure/data-tables";
import { observable } from "@trpc/server/observable";
import { z } from "zod";

const readMessagesInputSchema = messageSchema
  .pick({ partitionKey: true })
  .merge(z.object({ cursor: z.string().nullable() }));
export type ReadMessagesInput = z.infer<typeof readMessagesInputSchema>;

const onCreateMessageInputSchema = messageSchema.pick({ partitionKey: true });
export type OnCreateMessageInput = z.infer<typeof onCreateMessageInputSchema>;

const createMessageInputSchema = messageSchema.pick({ partitionKey: true, message: true });
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;

const onUpdateMessageInputSchema = messageSchema.pick({ partitionKey: true });
export type OnUpdateMessageInput = z.infer<typeof onUpdateMessageInputSchema>;

const updateMessageInputSchema = messageSchema.pick({ partitionKey: true, rowKey: true, message: true });
export type UpdateMessageInput = z.infer<typeof updateMessageInputSchema>;

const onDeleteMessageInputSchema = messageSchema.pick({ partitionKey: true });
export type OnDeleteMessageInput = z.infer<typeof onDeleteMessageInputSchema>;

const deleteMessageInputSchema = messageSchema.pick({ partitionKey: true, rowKey: true });
export type DeleteMessageInput = z.infer<typeof deleteMessageInputSchema>;

export const messageRouter = router({
  readMessages: getRoomUserProcedure(readMessagesInputSchema, "partitionKey")
    .input(readMessagesInputSchema)
    .query(async ({ input: { partitionKey, cursor } }) => {
      const filter = cursor
        ? odata`PartitionKey eq ${partitionKey} and RowKey gt ${cursor}`
        : odata`PartitionKey eq ${partitionKey}`;
      const messageClient = await getTableClient(AzureTable.Messages);
      const messages = await getTopNEntities(messageClient, FETCH_LIMIT + 1, MessageEntity, { filter });
      return { messages, nextCursor: getNextCursor(messages, "rowKey", FETCH_LIMIT) };
    }),
  onCreateMessage: getRoomUserProcedure(onCreateMessageInputSchema, "partitionKey")
    .input(onCreateMessageInputSchema)
    .subscription(({ input }) =>
      observable<MessageEntity>((emit) => {
        const onCreateMessage = (data: MessageEntity) => () => {
          if (data.partitionKey === input.partitionKey) emit.next(data);
        };
        customEventEmitter.on("onCreateMessage", onCreateMessage);
        return () => customEventEmitter.off("onCreateMessage", onCreateMessage);
      })
    ),
  createMessage: getRoomUserProcedure(createMessageInputSchema, "partitionKey")
    .input(createMessageInputSchema)
    .mutation(async ({ input, ctx }) => {
      // Auto create properties we already know
      const message: MessageEntity = {
        ...input,
        rowKey: getReverseTickedTimestamp(),
        creatorId: ctx.session.user.id,
        files: [],
        emojiMetadataTags: [],
        createdAt: new Date(),
      };

      try {
        const messageClient = await getTableClient(AzureTable.Messages);
        await messageClient.createEntity<AzureEntity<MessageEntity>>({
          ...message,
          files: JSON.stringify(message.files),
          emojiMetadataTags: JSON.stringify(message.emojiMetadataTags),
        });

        customEventEmitter.emit("onCreateMessage", message);
        return message;
      } catch {
        return null;
      }
    }),
  onUpdateMessage: getRoomUserProcedure(onUpdateMessageInputSchema, "partitionKey")
    .input(onUpdateMessageInputSchema)
    .subscription(({ input }) =>
      observable<UpdateMessageInput>((emit) => {
        const onUpdateMessage = (data: UpdateMessageInput) => () => {
          if (data.partitionKey === input.partitionKey) emit.next(data);
        };
        customEventEmitter.on("onUpdateMessage", onUpdateMessage);
        return () => customEventEmitter.off("onUpdateMessage", onUpdateMessage);
      })
    ),
  updateMessage: getRoomUserProcedure(updateMessageInputSchema, "partitionKey")
    .input(updateMessageInputSchema)
    .mutation(async ({ input }) => {
      try {
        const messageClient = await getTableClient(AzureTable.Messages);
        await messageClient.updateEntity<AzureUpdateEntity<MessageEntity>>(input);

        customEventEmitter.emit("onUpdateMessage", input);
        return input;
      } catch {
        return null;
      }
    }),
  onDeleteMessage: getRoomUserProcedure(onDeleteMessageInputSchema, "partitionKey")
    .input(onDeleteMessageInputSchema)
    .subscription(({ input }) =>
      observable<DeleteMessageInput>((emit) => {
        const onDeleteMessage = (data: DeleteMessageInput) => () => {
          if (data.partitionKey === input.partitionKey) emit.next(data);
        };
        customEventEmitter.on("onDeleteMessage", onDeleteMessage);
        return () => customEventEmitter.off("onDeleteMessage", onDeleteMessage);
      })
    ),
  deleteMessage: getRoomUserProcedure(deleteMessageInputSchema, "partitionKey")
    .input(deleteMessageInputSchema)
    .mutation(async ({ input: { partitionKey, rowKey } }) => {
      try {
        const messageClient = await getTableClient(AzureTable.Messages);
        await messageClient.deleteEntity(partitionKey, rowKey);

        customEventEmitter.emit("onDeleteMessage", { partitionKey, rowKey });
        return true;
      } catch {
        return false;
      }
    }),
});
