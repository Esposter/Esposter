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
import { useTableClient } from "@@/server/composables/azure/useTableClient";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { AZURE_MAX_PAGE_SIZE } from "@@/server/services/azure/table/constants";
import { createEntity } from "@@/server/services/azure/table/createEntity";
import { deleteEntity } from "@@/server/services/azure/table/deleteEntity";
import { getReverseTickedTimestamp } from "@@/server/services/azure/table/getReverseTickedTimestamp";
import { getTopNEntities } from "@@/server/services/azure/table/getTopNEntities";
import { updateEntity } from "@@/server/services/azure/table/updateEntity";
import { emojiEventEmitter } from "@@/server/services/esbabbler/events/emojiEventEmitter";
import { getMessagesPartitionKeyFilter } from "@@/server/services/esbabbler/getMessagesPartitionKeyFilter";
import { isMessagesPartitionKeyForRoomId } from "@@/server/services/esbabbler/isMessagesPartitionKeyForRoomId";
import { on } from "@@/server/services/events/on";
import { router } from "@@/server/trpc";
import { getRoomUserProcedure } from "@@/server/trpc/procedure/getRoomUserProcedure";
import { readMetadataInputSchema } from "@@/server/trpc/routers/message";
import { z } from "zod";

const onCreateEmojiInputSchema = z.interface({ roomId: selectRoomSchema.shape.id });
export type OnCreateEmojiInput = z.infer<typeof onCreateEmojiInputSchema>;

const onUpdateEmojiInputSchema = z.interface({ roomId: selectRoomSchema.shape.id });
export type OnUpdateEmojiInput = z.infer<typeof onUpdateEmojiInputSchema>;

const onDeleteEmojiInputSchema = z.interface({ roomId: selectRoomSchema.shape.id });
export type OnDeleteEmojiInput = z.infer<typeof onDeleteEmojiInputSchema>;

export const emojiRouter = router({
  createEmoji: getRoomUserProcedure(createEmojiInputSchema, "partitionKey")
    .input(createEmojiInputSchema)
    .mutation(async ({ ctx, input }) => {
      const messagesMetadataClient = (await useTableClient(
        AzureTable.MessagesMetadata,
      )) as CustomTableClient<MessageEmojiMetadataEntity>;
      const { emojiTag, messageRowKey, type } = MessageEmojiMetadataEntityPropertyNames;
      const foundEmojis = await getTopNEntities(messagesMetadataClient, 1, MessageEmojiMetadataEntity, {
        filter: `PartitionKey eq '${input.partitionKey}' and ${type} eq '${MessageMetadataType.Emoji}' and ${messageRowKey} eq '${input.messageRowKey}' and ${emojiTag} eq '${input.emojiTag}'`,
      });
      if (foundEmojis.length > 0) return;

      const newEmoji = new MessageEmojiMetadataEntity({
        emojiTag: input.emojiTag,
        messageRowKey: input.messageRowKey,
        partitionKey: input.partitionKey,
        rowKey: getReverseTickedTimestamp(),
        type: MessageMetadataType.Emoji,
        userIds: [ctx.session.user.id],
      });
      await createEntity(messagesMetadataClient, newEmoji);
      emojiEventEmitter.emit("createEmoji", newEmoji);
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
    .subscription(async function* ({ input, signal }) {
      for await (const [data] of on(emojiEventEmitter, "createEmoji", { signal }))
        if (isMessagesPartitionKeyForRoomId(data.partitionKey, input.roomId)) yield data;
    }),
  onDeleteEmoji: getRoomUserProcedure(onDeleteEmojiInputSchema, "roomId")
    .input(onDeleteEmojiInputSchema)
    .subscription(async function* ({ input, signal }) {
      for await (const [data] of on(emojiEventEmitter, "deleteEmoji", { signal }))
        if (isMessagesPartitionKeyForRoomId(data.partitionKey, input.roomId)) yield data;
    }),
  onUpdateEmoji: getRoomUserProcedure(onUpdateEmojiInputSchema, "roomId")
    .input(onUpdateEmojiInputSchema)
    .subscription(async function* ({ input, signal }) {
      for await (const [data] of on(emojiEventEmitter, "updateEmoji", { signal }))
        if (isMessagesPartitionKeyForRoomId(data.partitionKey, input.roomId)) yield data;
    }),
  readEmojis: getRoomUserProcedure(readMetadataInputSchema, "roomId")
    .input(readMetadataInputSchema)
    .query(async ({ input: { messageRowKeys, roomId } }) => {
      const messagesMetadataClient = (await useTableClient(
        AzureTable.MessagesMetadata,
      )) as CustomTableClient<MessageEmojiMetadataEntity>;
      const { messageRowKey, type } = MessageEmojiMetadataEntityPropertyNames;
      return getTopNEntities(messagesMetadataClient, AZURE_MAX_PAGE_SIZE, MessageEmojiMetadataEntity, {
        filter: `${getMessagesPartitionKeyFilter(roomId)} and ${type} eq '${
          MessageMetadataType.Emoji
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
      emojiEventEmitter.emit("updateEmoji", updatedEmoji);
    }),
});
