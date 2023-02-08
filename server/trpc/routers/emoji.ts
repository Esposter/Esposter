import type { AzureUpdateEntity, CompositeKey } from "@/models/azure";
import type { MessageEmojiMetadataEntity } from "@/models/azure/message/emoji";
import { messageEmojiMetadataSchema } from "@/models/azure/message/emoji";
import { emojiEventEmitter } from "@/models/events/emoji";
import { router } from "@/server/trpc";
import { getRoomUserProcedure } from "@/server/trpc/procedure";
import {
  createEmojiMetadataEntity,
  deleteEmojiMetadataEntity,
  updateEmojiMetadataEntity,
} from "@/services/azure/emoji";
import { observable } from "@trpc/server/observable";
import { unemojify } from "node-emoji";
import { z } from "zod";

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
    .mutation(async ({ input: { partitionKey, rowKey, emoji, messageRowKey }, ctx }) => {
      try {
        const newEmojiMetadataEntity: MessageEmojiMetadataEntity = {
          partitionKey,
          rowKey,
          emojiTag: unemojify(emoji),
          userIds: [ctx.session.user.id],
        };
        await createEmojiMetadataEntity(newEmojiMetadataEntity, messageRowKey);
        emojiEventEmitter.emit("onCreateEmoji", newEmojiMetadataEntity);
        return newEmojiMetadataEntity;
      } catch {
        return null;
      }
    }),
  onUpdateEmoji: getRoomUserProcedure(onUpdateEmojiInputSchema, "partitionKey")
    .input(onUpdateEmojiInputSchema)
    .subscription(({ input }) =>
      observable<AzureUpdateEntity<MessageEmojiMetadataEntity>>((emit) => {
        const onUpdateEmoji = (data: AzureUpdateEntity<MessageEmojiMetadataEntity>) => () => {
          if (data.partitionKey === input.partitionKey) emit.next(data);
        };
        emojiEventEmitter.on("onUpdateEmoji", onUpdateEmoji);
        return () => emojiEventEmitter.off("onUpdateEmoji", onUpdateEmoji);
      })
    ),
  // An update is adding the user to the user id list for the already existing emoji
  updateEmoji: getRoomUserProcedure(updateEmojiInputSchema, "partitionKey")
    .input(updateEmojiInputSchema)
    .mutation(async ({ input: { partitionKey, rowKey, userIds, messageRowKey }, ctx }) => {
      try {
        const updatedEmojiMetadataEntity = {
          partitionKey,
          rowKey,
          userIds: [...userIds, ctx.session.user.id],
        };
        await updateEmojiMetadataEntity(updatedEmojiMetadataEntity, messageRowKey);
        emojiEventEmitter.emit("onUpdateEmoji", updatedEmojiMetadataEntity);
        return updatedEmojiMetadataEntity;
      } catch {
        return null;
      }
    }),
  onDeleteEmoji: getRoomUserProcedure(onDeleteEmojiInputSchema, "partitionKey")
    .input(onDeleteEmojiInputSchema)
    .subscription(({ input }) =>
      observable<CompositeKey>((emit) => {
        const onDeleteEmoji = (data: CompositeKey) => () => {
          if (data.partitionKey === input.partitionKey) emit.next(data);
        };
        emojiEventEmitter.on("onDeleteEmoji", onDeleteEmoji);
        return () => emojiEventEmitter.off("onDeleteEmoji", onDeleteEmoji);
      })
    ),
  deleteEmoji: getRoomUserProcedure(updateEmojiInputSchema, "partitionKey")
    .input(updateEmojiInputSchema)
    .mutation(async ({ input: { partitionKey, rowKey, messageRowKey } }) => {
      try {
        await deleteEmojiMetadataEntity(partitionKey, rowKey, messageRowKey);
        emojiEventEmitter.emit("onDeleteEmoji", { partitionKey, rowKey });
        return true;
      } catch {
        return false;
      }
    }),
});
