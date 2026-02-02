import type { Clause, CustomTableClient } from "@esposter/db-schema";

import { createEmojiInputSchema } from "#shared/models/db/message/metadata/CreateEmojiInput";
import { deleteEmojiInputSchema } from "#shared/models/db/message/metadata/DeleteEmojiInput";
import {
  MessageEmojiMetadataEntity,
  MessageEmojiMetadataEntityPropertyNames,
} from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { updateEmojiInputSchema } from "#shared/models/db/message/metadata/UpdateEmojiInput";
import { createMessageEmojiMetadataEntity } from "#shared/services/message/createMessageEmojiMetadataEntity";
import { getUpdatedUserIds } from "#shared/services/message/emoji/getUpdatedUserIds";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getIsSameDevice } from "@@/server/services/auth/getIsSameDevice";
import { on } from "@@/server/services/events/on";
import { emojiEventEmitter } from "@@/server/services/message/events/emojiEventEmitter";
import { isRoomId } from "@@/server/services/message/isRoomId";
import { router } from "@@/server/trpc";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { readMetadataInputSchema } from "@@/server/trpc/routers/message";
import { createEntity, deleteEntity, getEntity, getTopNEntities, serializeClauses, updateEntity } from "@esposter/db";
import {
  AZURE_MAX_PAGE_SIZE,
  AzureTable,
  BinaryOperator,
  MessageMetadataType,
  selectRoomSchema,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
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
    const clauses: Clause[] = [
      {
        key: MessageEmojiMetadataEntityPropertyNames.partitionKey,
        operator: BinaryOperator.eq,
        value: input.partitionKey,
      },
      {
        key: MessageEmojiMetadataEntityPropertyNames.type,
        operator: BinaryOperator.eq,
        value: MessageMetadataType.Emoji,
      },
      {
        key: MessageEmojiMetadataEntityPropertyNames.messageRowKey,
        operator: BinaryOperator.eq,
        value: input.messageRowKey,
      },
      {
        key: MessageEmojiMetadataEntityPropertyNames.emojiTag,
        operator: BinaryOperator.eq,
        value: input.emojiTag,
      },
    ];
    const foundEmoji = (
      await getTopNEntities(messagesMetadataClient, 1, MessageEmojiMetadataEntity, {
        filter: serializeClauses(clauses),
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
    for await (const [[data, device]] of on(emojiEventEmitter, "createEmoji", { signal }))
      if (isRoomId(data.partitionKey, input.roomId) && !getIsSameDevice(device, ctx.session)) yield data;
  }),
  onDeleteEmoji: getMemberProcedure(onDeleteEmojiInputSchema, "roomId").subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    for await (const [[data, device]] of on(emojiEventEmitter, "deleteEmoji", { signal }))
      if (isRoomId(data.partitionKey, input.roomId) && !getIsSameDevice(device, ctx.session)) yield data;
  }),
  onUpdateEmoji: getMemberProcedure(onUpdateEmojiInputSchema, "roomId").subscription(async function* ({
    ctx,
    input,
    signal,
  }) {
    for await (const [[data, device]] of on(emojiEventEmitter, "updateEmoji", { signal }))
      if (isRoomId(data.partitionKey, input.roomId) && !getIsSameDevice(device, ctx.session)) yield data;
  }),
  readEmojis: getMemberProcedure(readMetadataInputSchema, "roomId").query(
    async ({ input: { messageRowKeys, roomId } }) => {
      const messagesMetadataClient = (await useTableClient(
        AzureTable.MessagesMetadata,
      )) as CustomTableClient<MessageEmojiMetadataEntity>;
      const clauses: Clause[] = [
        {
          key: MessageEmojiMetadataEntityPropertyNames.partitionKey,
          operator: BinaryOperator.eq,
          value: roomId,
        },
        {
          key: MessageEmojiMetadataEntityPropertyNames.type,
          operator: BinaryOperator.eq,
          value: MessageMetadataType.Emoji,
        },
      ];
      for (const messageRowKey of messageRowKeys)
        clauses.push({
          key: MessageEmojiMetadataEntityPropertyNames.messageRowKey,
          operator: BinaryOperator.eq,
          value: messageRowKey,
        });
      return getTopNEntities(messagesMetadataClient, AZURE_MAX_PAGE_SIZE, MessageEmojiMetadataEntity, {
        filter: serializeClauses(clauses),
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
    else if (readEmoji.userIds.length === 1 && takeOne(readEmoji.userIds) === ctx.session.user.id)
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
