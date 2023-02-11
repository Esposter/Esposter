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
// @NOTE: ESModule issue
// eslint-disable-next-line import/default
import nodeEmoji from "node-emoji";
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
    .mutation(async ({ input, ctx }) => {
      try {
        const newEmojiMetadataEntity: MessageEmojiMetadataEntity = {
          partitionKey: input.partitionKey,
          rowKey: input.rowKey,
          emojiTag: nodeEmoji.unemojify(input.emoji),
          userIds: [ctx.session.user.id],
        };
        await createEmojiMetadataEntity(newEmojiMetadataEntity, input.messageRowKey);
        emojiEventEmitter.emit("onCreateEmoji", newEmojiMetadataEntity);
        return newEmojiMetadataEntity;
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
          partitionKey: input.partitionKey,
          rowKey: input.rowKey,
          userIds: [...input.userIds, ctx.session.user.id],
        };
        await updateEmojiMetadataEntity(updatedEmojiMetadataEntity, input.messageRowKey);
        emojiEventEmitter.emit("onUpdateEmoji", input);
        return updatedEmojiMetadataEntity;
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
  deleteEmoji: getRoomUserProcedure(updateEmojiInputSchema, "partitionKey")
    .input(updateEmojiInputSchema)
    .mutation(async ({ input }) => {
      try {
        await deleteEmojiMetadataEntity(input.partitionKey, input.rowKey, input.messageRowKey);
        emojiEventEmitter.emit("onDeleteEmoji", input);
        return true;
      } catch {
        return false;
      }
    }),
});
