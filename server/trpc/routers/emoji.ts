import { messageSchema } from "@/models/azure/message";
import { MessageEmojiMetadataEntity, messageEmojiMetadataSchema } from "@/models/azure/message/emoji";
import { MessageMetadataType } from "@/models/azure/message/metadata";
import { AzureTable } from "@/models/azure/table";
import { emojiEventEmitter } from "@/models/events/emoji";
import { router } from "@/server/trpc";
import { getRoomUserProcedure } from "@/server/trpc/procedure";
import {
  createEntity,
  deleteEntity,
  getMessagesPartitionKeyFilter,
  getTableClient,
  getTopNEntities,
  updateEntity,
} from "@/services/azure/table";
import { READ_LIMIT } from "@/utils/pagination";
import { observable } from "@trpc/server/observable";
// @NOTE: ESModule issue
// eslint-disable-next-line import/default
import nodeEmoji from "node-emoji";
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

const onCreateEmojiInputSchema = messageEmojiMetadataSchema.pick({ partitionKey: true });
export type OnCreateEmojiInput = z.infer<typeof onCreateEmojiInputSchema>;

const createEmojiInputSchema = messageEmojiMetadataSchema
  .pick({ partitionKey: true, rowKey: true })
  .merge(z.object({ emoji: z.string(), messageRowKey: z.string() }));
export type CreateEmojiInput = z.infer<typeof createEmojiInputSchema>;

const onUpdateEmojiInputSchema = messageEmojiMetadataSchema.pick({ partitionKey: true });
export type OnUpdateEmojiInput = z.infer<typeof onUpdateEmojiInputSchema>;

const updateEmojiInputSchema = messageEmojiMetadataSchema
  .pick({ partitionKey: true, rowKey: true, userIds: true })
  .merge(z.object({ messageRowKey: z.string() }));
export type UpdateEmojiInput = z.infer<typeof updateEmojiInputSchema>;

const onDeleteEmojiInputSchema = messageEmojiMetadataSchema.pick({ partitionKey: true });
export type OnDeleteEmojiInput = z.infer<typeof onDeleteEmojiInputSchema>;

const deleteEmojiInputSchema = messageEmojiMetadataSchema
  .pick({ partitionKey: true, rowKey: true })
  .merge(z.object({ messageRowKey: z.string() }));
export type DeleteEmojiInput = z.infer<typeof deleteEmojiInputSchema>;

export const emojiRouter = router({
  readEmojis: getRoomUserProcedure(readEmojisInputSchema, "roomId")
    .input(readEmojisInputSchema)
    .query(async ({ input: { roomId, messages } }) => {
      const client = await getTableClient(AzureTable.MessagesMetadata);
      return getTopNEntities(client, READ_LIMIT, MessageEmojiMetadataEntity, {
        filter: `${getMessagesPartitionKeyFilter(roomId)} and (${messages
          .map((m) => `messageRowKey eq '${m.rowKey}'`)
          .join(" or ")})`,
      });
    }),
  onCreateEmoji: getRoomUserProcedure(onCreateEmojiInputSchema, "partitionKey")
    .input(onCreateEmojiInputSchema)
    .subscription(({ input }) =>
      observable<MessageEmojiMetadataEntity>((emit) => {
        const onCreateEmoji = (data: MessageEmojiMetadataEntity) => () => {
          if (data.partitionKey === input.partitionKey) emit.next(data);
        };
        emojiEventEmitter.on("onCreateEmoji", onCreateEmoji);
        return () => emojiEventEmitter.off("onCreateEmoji", onCreateEmoji);
      })
    ),
  createEmoji: getRoomUserProcedure(createEmojiInputSchema, "partitionKey")
    .input(createEmojiInputSchema)
    .mutation(async ({ input, ctx }) => {
      try {
        const newEmojiMetadataEntity: MessageEmojiMetadataEntity = {
          ...input,
          type: MessageMetadataType.Emoji,
          emojiTag: nodeEmoji.unemojify(input.emoji),
          userIds: [ctx.session.user.id],
        };
        const client = await getTableClient(AzureTable.MessagesMetadata);
        await createEntity<MessageEmojiMetadataEntity>(client, newEmojiMetadataEntity);
        const result = { ...input, ...newEmojiMetadataEntity };
        emojiEventEmitter.emit("onCreateEmoji", result);
        return result;
      } catch {
        return null;
      }
    }),
  onUpdateEmoji: getRoomUserProcedure(onUpdateEmojiInputSchema, "partitionKey")
    .input(onUpdateEmojiInputSchema)
    .subscription(({ input }) =>
      observable<UpdateEmojiInput>((emit) => {
        const onUpdateEmoji = (data: UpdateEmojiInput) => () => {
          if (data.partitionKey === input.partitionKey) emit.next(data);
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
          type: MessageMetadataType.Emoji,
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
  onDeleteEmoji: getRoomUserProcedure(onDeleteEmojiInputSchema, "partitionKey")
    .input(onDeleteEmojiInputSchema)
    .subscription(({ input }) =>
      observable<DeleteEmojiInput>((emit) => {
        const onDeleteEmoji = (data: DeleteEmojiInput) => () => {
          if (data.partitionKey === input.partitionKey) emit.next(data);
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
