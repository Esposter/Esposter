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
import { createMessageEmojiMetadataEntity } from "#shared/services/message/createMessageEmojiMetadataEntity";
import { getUpdatedUserIds } from "#shared/services/message/emoji/getUpdatedUserIds";
import { useTableClient } from "@@/server/composables/azure/useTableClient";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { getIsSameDevice } from "@@/server/services/auth/getIsSameDevice";
import { AZURE_MAX_PAGE_SIZE } from "@@/server/services/azure/table/constants";
import { createEntity } from "@@/server/services/azure/table/createEntity";
import { deleteEntity } from "@@/server/services/azure/table/deleteEntity";
import { getEntity } from "@@/server/services/azure/table/getEntity";
import { getTopNEntities } from "@@/server/services/azure/table/getTopNEntities";
import { updateEntity } from "@@/server/services/azure/table/updateEntity";
import { on } from "@@/server/services/events/on";
import { emojiEventEmitter } from "@@/server/services/message/events/emojiEventEmitter";
import { isRoomId } from "@@/server/services/message/isRoomId";
import { router } from "@@/server/trpc";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { readMetadataInputSchema } from "@@/server/trpc/routers/message";
import { BinaryOperator, InvalidOperationError, isPartitionKey, Operation, UnaryOperator } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const onCreateEmojiInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnCreateEmojiInput = z.infer<typeof onCreateEmojiInputSchema>;

const onUpdateEmojiInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnUpdateEmojiInput = z.infer<typeof onUpdateEmojiInputSchema>;

const onDeleteEmojiInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnDeleteEmojiInput = z.infer<typeof onDeleteEmojiInputSchema>;

export const emojiRouter = router({
  createEmoji: getMemberProcedure(createEmojiInputSchema, "partitionKey").mutation(async ({ ctx, input }) => {
    const messagesMetadataClient = (await useTableClient(
      AzureTable.MessagesMetadata,
    )) as CustomTableClient<MessageEmojiMetadataEntity>;
    const { emojiTag, messageRowKey, type } = MessageEmojiMetadataEntityPropertyNames;
    const foundEmoji = (
      await getTopNEntities(messagesMetadataClient, 1, MessageEmojiMetadataEntity, {
        filter: `${isPartitionKey(input.partitionKey)} ${UnaryOperator.and} ${type} ${BinaryOperator.eq} '${MessageMetadataType.Emoji}' ${UnaryOperator.and} ${messageRowKey} ${BinaryOperator.eq} '${input.messageRowKey}' ${UnaryOperator.and} ${emojiTag} ${BinaryOperator.eq} '${input.emojiTag}'`,
      })
    ).find(Boolean);
    if (foundEmoji)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Create, MessageMetadataType.Emoji, JSON.stringify(foundEmoji))
          .message,
      });

    const newEmoji = createMessageEmojiMetadataEntity({ ...input, userIds: [ctx.session.user.id] });
    await createEntity(messagesMetadataClient, newEmoji);
    emojiEventEmitter.emit("createEmoji", [
      newEmoji,
      { sessionId: ctx.session.session.id, userId: ctx.session.user.id },
    ]);
    return newEmoji;
  }),
  deleteEmoji: getMemberProcedure(deleteEmojiInputSchema, "partitionKey").mutation(async ({ ctx, input }) => {
    const messagesMetadataClient = await useTableClient(AzureTable.MessagesMetadata);
    await deleteEntity(messagesMetadataClient, input.partitionKey, input.rowKey);
    emojiEventEmitter.emit("deleteEmoji", [input, { sessionId: ctx.session.session.id, userId: ctx.session.user.id }]);
  }),
  onCreateEmoji: getMemberProcedure(onCreateEmojiInputSchema, "roomId").subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    for await (const [[data, deviceId]] of on(emojiEventEmitter, "createEmoji", { signal }))
      if (isRoomId(data.partitionKey, input.roomId) && !getIsSameDevice(deviceId, ctx.session)) yield data;
  }),
  onDeleteEmoji: getMemberProcedure(onDeleteEmojiInputSchema, "roomId").subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    for await (const [[data, deviceId]] of on(emojiEventEmitter, "deleteEmoji", { signal }))
      if (isRoomId(data.partitionKey, input.roomId) && !getIsSameDevice(deviceId, ctx.session)) yield data;
  }),
  onUpdateEmoji: getMemberProcedure(onUpdateEmojiInputSchema, "roomId").subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    for await (const [[data, deviceId]] of on(emojiEventEmitter, "updateEmoji", { signal }))
      if (isRoomId(data.partitionKey, input.roomId) && !getIsSameDevice(deviceId, ctx.session)) yield data;
  }),
  readEmojis: getMemberProcedure(readMetadataInputSchema, "roomId").query(
    async ({ input: { messageRowKeys, roomId } }) => {
      const messagesMetadataClient = (await useTableClient(
        AzureTable.MessagesMetadata,
      )) as CustomTableClient<MessageEmojiMetadataEntity>;
      const { messageRowKey, type } = MessageEmojiMetadataEntityPropertyNames;
      return getTopNEntities(messagesMetadataClient, AZURE_MAX_PAGE_SIZE, MessageEmojiMetadataEntity, {
        filter: `${isPartitionKey(roomId)} ${UnaryOperator.and} ${type} ${BinaryOperator.eq} '${
          MessageMetadataType.Emoji
        }' ${UnaryOperator.and} (${messageRowKeys.map((mrk) => `${messageRowKey} ${BinaryOperator.eq} '${mrk}'`).join(` ${UnaryOperator.or} `)})`,
      });
    },
  ),
  updateEmoji: getMemberProcedure(updateEmojiInputSchema, "partitionKey").mutation(async ({ ctx, input }) => {
    const messagesMetadataClient = (await useTableClient(
      AzureTable.MessagesMetadata,
    )) as CustomTableClient<MessageEmojiMetadataEntity>;
    const readEmoji = await getEntity(
      messagesMetadataClient,
      MessageEmojiMetadataEntity,
      input.partitionKey,
      input.rowKey,
    );
    if (!readEmoji)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Read, MessageMetadataType.Emoji, JSON.stringify(input)).message,
      });
    else if (readEmoji.userIds.length === 1 && readEmoji.userIds[0] === ctx.session.user.id)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Update, MessageMetadataType.Emoji, JSON.stringify(readEmoji))
          .message,
      });

    const updatedEmoji = { ...input, userIds: getUpdatedUserIds(readEmoji.userIds, ctx.session.user.id) };
    await updateEntity(messagesMetadataClient, updatedEmoji);
    emojiEventEmitter.emit("updateEmoji", [
      updatedEmoji,
      { sessionId: ctx.session.session.id, userId: ctx.session.user.id },
    ]);
  }),
});
