import { selectRoomSchema } from "@/db/schema/rooms";
import { AzureTable, type CustomTableClient } from "@/models/azure/table";
import { emojiEventEmitter } from "@/models/esbabbler/events/emoji";
import {
  MessageEmojiMetadataEntity,
  MessageEmojiMetadataEntityProperties,
  messageEmojiMetadataSchema,
} from "@/models/esbabbler/message/emoji";
import { MessageMetadataType } from "@/models/esbabbler/message/metadata";
import { router } from "@/server/trpc";
import { getRoomUserProcedure } from "@/server/trpc/procedure";
import { readMetadataInputSchema } from "@/server/trpc/routers/message";
import {
  AZURE_MAX_PAGE_SIZE,
  createEntity,
  deleteEntity,
  getTableClient,
  getTopNEntities,
  updateEntity,
} from "@/services/azure/table";
import { getMessagesPartitionKeyFilter } from "@/services/esbabbler/table";
import { now } from "@/util/time";
import { odata } from "@azure/data-tables";
import { observable } from "@trpc/server/observable";
import { z } from "zod";

const onCreateEmojiInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnCreateEmojiInput = z.infer<typeof onCreateEmojiInputSchema>;

const createEmojiInputSchema = messageEmojiMetadataSchema.pick({
  partitionKey: true,
  messageRowKey: true,
  emojiTag: true,
});
export type CreateEmojiInput = z.infer<typeof createEmojiInputSchema>;

const onUpdateEmojiInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnUpdateEmojiInput = z.infer<typeof onUpdateEmojiInputSchema>;

const updateEmojiInputSchema = messageEmojiMetadataSchema.pick({
  partitionKey: true,
  rowKey: true,
  messageRowKey: true,
  userIds: true,
});
export type UpdateEmojiInput = z.infer<typeof updateEmojiInputSchema>;

const onDeleteEmojiInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnDeleteEmojiInput = z.infer<typeof onDeleteEmojiInputSchema>;

const deleteEmojiInputSchema = messageEmojiMetadataSchema.pick({
  partitionKey: true,
  rowKey: true,
  messageRowKey: true,
});
export type DeleteEmojiInput = z.infer<typeof deleteEmojiInputSchema>;

export const emojiRouter = router({
  readEmojis: getRoomUserProcedure(readMetadataInputSchema, "roomId")
    .input(readMetadataInputSchema)
    .query(async ({ input: { roomId, messageRowKeys } }) => {
      const messagesMetadataClient = (await getTableClient(
        AzureTable.MessagesMetadata,
      )) as CustomTableClient<MessageEmojiMetadataEntity>;
      const { type, messageRowKey } = MessageEmojiMetadataEntityProperties;
      return getTopNEntities(messagesMetadataClient, AZURE_MAX_PAGE_SIZE, MessageEmojiMetadataEntity, {
        filter: `${getMessagesPartitionKeyFilter(roomId)} and ${type} eq '${
          MessageMetadataType.EmojiTag
        }' and (${messageRowKeys.map((mrk) => `${messageRowKey} eq '${mrk}'`).join(" or ")})`,
      });
    }),
  onCreateEmoji: getRoomUserProcedure(onCreateEmojiInputSchema, "roomId")
    .input(onCreateEmojiInputSchema)
    .subscription(({ input }) =>
      observable<MessageEmojiMetadataEntity>((emit) => {
        const onCreateEmoji = (data: MessageEmojiMetadataEntity) => () => {
          if (data.partitionKey.startsWith(input.roomId)) emit.next(data);
        };
        emojiEventEmitter.on("createEmoji", onCreateEmoji);
        return () => emojiEventEmitter.off("createEmoji", onCreateEmoji);
      }),
    ),
  createEmoji: getRoomUserProcedure(createEmojiInputSchema, "partitionKey")
    .input(createEmojiInputSchema)
    .mutation(async ({ input, ctx }) => {
      const messagesMetadataClient = await getTableClient(AzureTable.MessagesMetadata);
      const { type, messageRowKey, emojiTag } = MessageEmojiMetadataEntityProperties;
      const foundEmojis = await getTopNEntities(messagesMetadataClient, 1, MessageEmojiMetadataEntity, {
        filter: odata`PartitionKey eq ${input.partitionKey} and ${type} eq ${MessageMetadataType.EmojiTag} and ${messageRowKey} eq ${input.messageRowKey} and ${emojiTag} eq ${input.emojiTag}`,
      });
      if (foundEmojis.length > 0) return null;

      const newEmoji = new MessageEmojiMetadataEntity({
        partitionKey: input.partitionKey,
        rowKey: now(),
        messageRowKey: input.messageRowKey,
        type: MessageMetadataType.EmojiTag,
        emojiTag: input.emojiTag,
        userIds: [ctx.session.user.id],
      });
      await createEntity(messagesMetadataClient, newEmoji);
      emojiEventEmitter.emit("createEmoji", newEmoji);
      return newEmoji;
    }),
  onUpdateEmoji: getRoomUserProcedure(onUpdateEmojiInputSchema, "roomId")
    .input(onUpdateEmojiInputSchema)
    .subscription(({ input }) =>
      observable<UpdateEmojiInput>((emit) => {
        const onUpdateEmoji = (data: UpdateEmojiInput) => () => {
          if (data.partitionKey.startsWith(input.roomId)) emit.next(data);
        };
        emojiEventEmitter.on("updateEmoji", onUpdateEmoji);
        return () => emojiEventEmitter.off("updateEmoji", onUpdateEmoji);
      }),
    ),
  // An update is adding the user to the user id list for the already existing emoji
  updateEmoji: getRoomUserProcedure(updateEmojiInputSchema, "partitionKey")
    .input(updateEmojiInputSchema)
    .mutation(async ({ input, ctx }) => {
      const updatedEmoji = {
        ...input,
        userIds: [...input.userIds, ctx.session.user.id],
      };
      const messagesMetadataClient = await getTableClient(AzureTable.MessagesMetadata);
      await updateEntity(messagesMetadataClient, updatedEmoji);
      emojiEventEmitter.emit("updateEmoji", input);
      return input;
    }),
  onDeleteEmoji: getRoomUserProcedure(onDeleteEmojiInputSchema, "roomId")
    .input(onDeleteEmojiInputSchema)
    .subscription(({ input }) =>
      observable<DeleteEmojiInput>((emit) => {
        const onDeleteEmoji = (data: DeleteEmojiInput) => () => {
          if (data.partitionKey.startsWith(input.roomId)) emit.next(data);
        };
        emojiEventEmitter.on("deleteEmoji", onDeleteEmoji);
        return () => emojiEventEmitter.off("deleteEmoji", onDeleteEmoji);
      }),
    ),
  deleteEmoji: getRoomUserProcedure(deleteEmojiInputSchema, "partitionKey")
    .input(deleteEmojiInputSchema)
    .mutation(async ({ input }) => {
      const messagesMetadataClient = await getTableClient(AzureTable.MessagesMetadata);
      await deleteEntity(messagesMetadataClient, input.partitionKey, input.rowKey);
      emojiEventEmitter.emit("deleteEmoji", input);
    }),
});
