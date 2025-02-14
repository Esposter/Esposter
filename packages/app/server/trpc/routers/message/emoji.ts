import type { DeleteEmojiInput } from "#shared/models/db/message/metadata/DeleteEmojiInput";
import type { UpdateEmojiInput } from "#shared/models/db/message/metadata/UpdateEmojiInput";
import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";

import { selectRoomSchema } from "#shared/db/schema/rooms";
import { createEmojiInputSchema } from "#shared/models/db/message/metadata/CreateEmojiInput";
import { deleteEmojiInputSchema } from "#shared/models/db/message/metadata/DeleteEmojiInput";
import {
  MessageEmojiMetadataEntity,
  MessageEmojiMetadataEntityPropertyNames,
} from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";
import { updateEmojiInputSchema } from "#shared/models/db/message/metadata/UpdateEmojiInput";
import { now } from "#shared/util/time/now";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { AZURE_MAX_PAGE_SIZE } from "@@/server/services/azure/table/constants";
import { createEntity } from "@@/server/services/azure/table/createEntity";
import { deleteEntity } from "@@/server/services/azure/table/deleteEntity";
import { getTopNEntities } from "@@/server/services/azure/table/getTopNEntities";
import { updateEntity } from "@@/server/services/azure/table/updateEntity";
import { emojiEventEmitter } from "@@/server/services/esbabbler/events/emojiEventEmitter";
import { getMessagesPartitionKeyFilter } from "@@/server/services/esbabbler/getMessagesPartitionKeyFilter";
import { router } from "@@/server/trpc";
import { getRoomUserProcedure } from "@@/server/trpc/procedure/getRoomUserProcedure";
import { readMetadataInputSchema } from "@@/server/trpc/routers/message";
import { useTableClient } from "@@/server/util/azure/useTableClient";
import { observable } from "@trpc/server/observable";
import { z } from "zod";

const onCreateEmojiInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnCreateEmojiInput = z.infer<typeof onCreateEmojiInputSchema>;

const onUpdateEmojiInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnUpdateEmojiInput = z.infer<typeof onUpdateEmojiInputSchema>;

const onDeleteEmojiInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnDeleteEmojiInput = z.infer<typeof onDeleteEmojiInputSchema>;

export const emojiRouter = router({
  createEmoji: getRoomUserProcedure(createEmojiInputSchema, "partitionKey")
    .input(createEmojiInputSchema)
    .mutation<MessageEmojiMetadataEntity | null>(async ({ ctx, input }) => {
      const messagesMetadataClient = await useTableClient(AzureTable.MessagesMetadata);
      const { emojiTag, messageRowKey, type } = MessageEmojiMetadataEntityPropertyNames;
      const foundEmojis = await getTopNEntities(messagesMetadataClient, 1, MessageEmojiMetadataEntity, {
        filter: `PartitionKey eq '${input.partitionKey}' and ${type} eq '${MessageMetadataType.EmojiTag}' and ${messageRowKey} eq '${input.messageRowKey}' and ${emojiTag} eq '${input.emojiTag}'`,
      });
      if (foundEmojis.length > 0) return null;

      const newEmoji = new MessageEmojiMetadataEntity({
        emojiTag: input.emojiTag,
        messageRowKey: input.messageRowKey,
        partitionKey: input.partitionKey,
        rowKey: now(),
        type: MessageMetadataType.EmojiTag,
        userIds: [ctx.session.user.id],
      });
      await createEntity(messagesMetadataClient, newEmoji);
      emojiEventEmitter.emit("createEmoji", newEmoji);
      return newEmoji;
    }),
  deleteEmoji: getRoomUserProcedure(deleteEmojiInputSchema, "partitionKey")
    .input(deleteEmojiInputSchema)
    .mutation(async ({ input }) => {
      const messagesMetadataClient = await useTableClient(AzureTable.MessagesMetadata);
      await deleteEntity(messagesMetadataClient, input.partitionKey, input.rowKey);
      emojiEventEmitter.emit("deleteEmoji", input);
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
  readEmojis: getRoomUserProcedure(readMetadataInputSchema, "roomId")
    .input(readMetadataInputSchema)
    .query(async ({ input: { messageRowKeys, roomId } }) => {
      const messagesMetadataClient = (await useTableClient(
        AzureTable.MessagesMetadata,
      )) as CustomTableClient<MessageEmojiMetadataEntity>;
      const { messageRowKey, type } = MessageEmojiMetadataEntityPropertyNames;
      return getTopNEntities(messagesMetadataClient, AZURE_MAX_PAGE_SIZE, MessageEmojiMetadataEntity, {
        filter: `${getMessagesPartitionKeyFilter(roomId)} and ${type} eq '${
          MessageMetadataType.EmojiTag
        }' and (${messageRowKeys.map((mrk) => `${messageRowKey} eq '${mrk}'`).join(" or ")})`,
      });
    }),
  // An update is adding the user to the user id list for the already existing emoji
  updateEmoji: getRoomUserProcedure(updateEmojiInputSchema, "partitionKey")
    .input(updateEmojiInputSchema)
    .mutation(async ({ ctx, input }) => {
      const updatedEmoji = { ...input, userIds: [...input.userIds, ctx.session.user.id] };
      const messagesMetadataClient = await useTableClient(AzureTable.MessagesMetadata);
      await updateEntity(messagesMetadataClient, updatedEmoji);
      emojiEventEmitter.emit("updateEmoji", input);
      return input;
    }),
});
