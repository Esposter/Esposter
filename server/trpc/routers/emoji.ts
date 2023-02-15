import { messageSchema } from "@/models/azure/message";
import { MessageEmojiMetadataEntity, messageEmojiMetadataSchema } from "@/models/azure/message/emoji";
import { MessageMetadataType } from "@/models/azure/message/metadata";
import { AzureTable } from "@/models/azure/table";
import { emojiEventEmitter } from "@/models/events/emoji";
import { router } from "@/server/trpc";
import { getRoomUserProcedure } from "@/server/trpc/procedure";
import { roomSchema } from "@/server/trpc/routers/room";
import {
  AZURE_MAX_PAGE_SIZE,
  createEntity,
  deleteEntity,
  getMessagesPartitionKeyFilter,
  getTableClient,
  getTopNEntities,
  updateEntity,
} from "@/services/azure/table";
import { now } from "@/utils/time";
import { odata } from "@azure/data-tables";
import { observable } from "@trpc/server/observable";
import { z } from "zod";

const readEmojisInputSchema = z.object({
  roomId: z.string().uuid(),
  messages: z.array(
    messageSchema.pick({
      rowKey: true,
    })
  ),
});
export type ReadEmojisInput = z.infer<typeof readEmojisInputSchema>;

const onCreateEmojiInputSchema = z.object({ roomId: roomSchema.shape.id });
export type OnCreateEmojiInput = z.infer<typeof onCreateEmojiInputSchema>;

const createEmojiInputSchema = messageSchema
  .pick({ partitionKey: true })
  .merge(z.object({ messageRowKey: messageSchema.shape.rowKey }))
  .merge(messageEmojiMetadataSchema.pick({ emojiTag: true }));
export type CreateEmojiInput = z.infer<typeof createEmojiInputSchema>;

const onUpdateEmojiInputSchema = z.object({ roomId: roomSchema.shape.id });
export type OnUpdateEmojiInput = z.infer<typeof onUpdateEmojiInputSchema>;

const updateEmojiInputSchema = messageEmojiMetadataSchema
  .pick({ partitionKey: true, rowKey: true, userIds: true })
  .merge(z.object({ messageRowKey: messageSchema.shape.rowKey }));
export type UpdateEmojiInput = z.infer<typeof updateEmojiInputSchema>;

const onDeleteEmojiInputSchema = z.object({ roomId: roomSchema.shape.id });
export type OnDeleteEmojiInput = z.infer<typeof onDeleteEmojiInputSchema>;

const deleteEmojiInputSchema = messageEmojiMetadataSchema
  .pick({ partitionKey: true, rowKey: true })
  .merge(z.object({ messageRowKey: messageSchema.shape.rowKey }));
export type DeleteEmojiInput = z.infer<typeof deleteEmojiInputSchema>;

export const emojiRouter = router({
  readEmojis: getRoomUserProcedure(readEmojisInputSchema, "roomId")
    .input(readEmojisInputSchema)
    .query(async ({ input: { roomId, messages } }) => {
      const client = await getTableClient(AzureTable.MessagesMetadata);
      return getTopNEntities(client, AZURE_MAX_PAGE_SIZE, MessageEmojiMetadataEntity, {
        filter: `${getMessagesPartitionKeyFilter(roomId)} and (${messages
          .map((m) => `messageRowKey eq '${m.rowKey}'`)
          .join(" or ")})`,
      });
    }),
  onCreateEmoji: getRoomUserProcedure(onCreateEmojiInputSchema, "roomId")
    .input(onCreateEmojiInputSchema)
    .subscription(({ input }) =>
      observable<MessageEmojiMetadataEntity>((emit) => {
        const onCreateEmoji = (data: MessageEmojiMetadataEntity) => () => {
          if (data.partitionKey.startsWith(input.roomId)) emit.next(data);
        };
        emojiEventEmitter.on("onCreateEmoji", onCreateEmoji);
        return () => emojiEventEmitter.off("onCreateEmoji", onCreateEmoji);
      })
    ),
  createEmoji: getRoomUserProcedure(createEmojiInputSchema, "partitionKey")
    .input(createEmojiInputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const client = await getTableClient(AzureTable.MessagesMetadata);
        const foundEmojis = await getTopNEntities(client, 1, MessageEmojiMetadataEntity, {
          filter: odata`PartitionKey eq ${input.partitionKey} and messageRowKey eq ${input.messageRowKey} and emojiTag eq ${input.emojiTag}`,
        });
        if (foundEmojis.length > 0) return null;

        const newEmojiMetadataEntity: MessageEmojiMetadataEntity = {
          partitionKey: input.partitionKey,
          rowKey: now(),
          messageRowKey: input.messageRowKey,
          type: MessageMetadataType.EmojiTag,
          emojiTag: input.emojiTag,
          userIds: [ctx.session.user.id],
        };
        await createEntity<MessageEmojiMetadataEntity>(client, newEmojiMetadataEntity);
        const result = { ...input, ...newEmojiMetadataEntity };
        emojiEventEmitter.emit("onCreateEmoji", result);
        return result;
      } catch {
        return null;
      }
    }),
  onUpdateEmoji: getRoomUserProcedure(onUpdateEmojiInputSchema, "roomId")
    .input(onUpdateEmojiInputSchema)
    .subscription(({ input }) =>
      observable<UpdateEmojiInput>((emit) => {
        const onUpdateEmoji = (data: UpdateEmojiInput) => () => {
          if (data.partitionKey.startsWith(input.roomId)) emit.next(data);
        };
        emojiEventEmitter.on("onUpdateEmoji", onUpdateEmoji);
        return () => emojiEventEmitter.off("onUpdateEmoji", onUpdateEmoji);
      })
    ),
  // An update is adding the user to the user id list for the already existing emoji
  updateEmoji: getRoomUserProcedure(updateEmojiInputSchema, "partitionKey")
    .input(updateEmojiInputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const updatedEmojiMetadataEntity = {
          ...input,
          userIds: [...input.userIds, ctx.session.user.id],
        };
        const client = await getTableClient(AzureTable.MessagesMetadata);
        await updateEntity<MessageEmojiMetadataEntity>(client, updatedEmojiMetadataEntity);
        emojiEventEmitter.emit("onUpdateEmoji", input);
        return input;
      } catch {
        return null;
      }
    }),
  onDeleteEmoji: getRoomUserProcedure(onDeleteEmojiInputSchema, "roomId")
    .input(onDeleteEmojiInputSchema)
    .subscription(({ input }) =>
      observable<DeleteEmojiInput>((emit) => {
        const onDeleteEmoji = (data: DeleteEmojiInput) => () => {
          if (data.partitionKey.startsWith(input.roomId)) emit.next(data);
        };
        emojiEventEmitter.on("onDeleteEmoji", onDeleteEmoji);
        return () => emojiEventEmitter.off("onDeleteEmoji", onDeleteEmoji);
      })
    ),
  deleteEmoji: getRoomUserProcedure(deleteEmojiInputSchema, "partitionKey")
    .input(deleteEmojiInputSchema)
    .mutation(async ({ input }) => {
      try {
        const client = await getTableClient(AzureTable.MessagesMetadata);
        await deleteEntity(client, input.partitionKey, input.rowKey);
        emojiEventEmitter.emit("onDeleteEmoji", input);
        return true;
      } catch {
        return false;
      }
    }),
});
