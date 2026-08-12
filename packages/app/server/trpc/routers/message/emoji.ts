import type { Clause, CustomTableClient } from "@esposter/db-schema";

import { createEmojiInputSchema } from "#shared/models/db/message/metadata/CreateEmojiInput";
import { deleteEmojiInputSchema } from "#shared/models/db/message/metadata/DeleteEmojiInput";
import {
  MessageEmojiMetadataEntity,
  MessageEmojiMetadataEntityPropertyNames,
} from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { updateEmojiInputSchema } from "#shared/models/db/message/metadata/UpdateEmojiInput";
import { readMetadataInputSchema } from "#shared/models/db/message/ReadMetadataInput";
import { createMessageEmojiMetadataEntity } from "#shared/services/message/createMessageEmojiMetadataEntity";
import { getUpdatedUserIds } from "#shared/services/message/emoji/getUpdatedUserIds";
import { useTableClient } from "@@/server/composables/azure/table/useTableClient";
import { getDevice } from "@@/server/services/auth/getDevice";
import { emojiEventEmitter } from "@@/server/services/message/events/emojiEventEmitter";
import { router } from "@@/server/trpc";
import { requireEntity } from "@@/server/trpc/guards/requireEntity";
import { getMemberProcedure } from "@@/server/trpc/procedure/room/getMemberProcedure";
import { getRoomEventSubscription } from "@@/server/trpc/procedure/room/getRoomEventSubscription";
import { createEntity, getEntity, getTopNEntities, serializeClauses, updateEntity } from "@esposter/db";
import {
  AZURE_MAX_PAGE_SIZE,
  AzureTable,
  BinaryOperator,
  CompositeKeyPropertyNames,
  MessageMetadataType,
} from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";

// The MessagesMetadata table holds every metadata type, so every read here narrows it to the emoji rows
const useMessageEmojiMetadataClient = async () =>
  (await useTableClient(AzureTable.MessagesMetadata)) as CustomTableClient<MessageEmojiMetadataEntity>;
// The "emoji rows of this room" predicate every query in this router starts from
const getEmojiMetadataClauses = (partitionKey: string): Clause<MessageEmojiMetadataEntity>[] => [
  { key: CompositeKeyPropertyNames.partitionKey, operator: BinaryOperator.eq, value: partitionKey },
  { key: MessageEmojiMetadataEntityPropertyNames.type, operator: BinaryOperator.eq, value: MessageMetadataType.Emoji },
];

export const emojiRouter = router({
  createEmoji: getMemberProcedure(createEmojiInputSchema, CompositeKeyPropertyNames.partitionKey).mutation(
    async ({ ctx, input }) => {
      const messagesMetadataClient = await useMessageEmojiMetadataClient();
      const clauses: Clause<MessageEmojiMetadataEntity>[] = [
        ...getEmojiMetadataClauses(input.partitionKey),
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
      )[0];
      if (foundEmoji)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, MessageMetadataType.Emoji, JSON.stringify(foundEmoji))
            .message,
        });

      const newEmoji = createMessageEmojiMetadataEntity({ ...input, userIds: [ctx.getSessionPayload.user.id] });
      await createEntity(messagesMetadataClient, newEmoji);
      emojiEventEmitter.emit("createEmoji", [newEmoji, getDevice(ctx.getSessionPayload)]);
      return newEmoji;
    },
  ),
  deleteEmoji: getMemberProcedure(deleteEmojiInputSchema, CompositeKeyPropertyNames.partitionKey).mutation(
    async ({ ctx, input }) => {
      const messagesMetadataClient = await useTableClient(AzureTable.MessagesMetadata);
      await messagesMetadataClient.deleteEntity(input.partitionKey, input.rowKey);
      emojiEventEmitter.emit("deleteEmoji", [input, getDevice(ctx.getSessionPayload)]);
    },
  ),
  onCreateEmoji: getRoomEventSubscription(emojiEventEmitter, "createEmoji", ({ partitionKey }) => partitionKey),
  onDeleteEmoji: getRoomEventSubscription(emojiEventEmitter, "deleteEmoji", ({ partitionKey }) => partitionKey),
  onUpdateEmoji: getRoomEventSubscription(emojiEventEmitter, "updateEmoji", ({ partitionKey }) => partitionKey),
  readEmojis: getMemberProcedure(readMetadataInputSchema, "roomId").query(
    async ({ input: { messageRowKeys, roomId } }) => {
      const messagesMetadataClient = await useMessageEmojiMetadataClient();
      const clauses = getEmojiMetadataClauses(roomId);
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
  updateEmoji: getMemberProcedure(updateEmojiInputSchema, CompositeKeyPropertyNames.partitionKey).mutation(
    async ({ ctx, input }) => {
      const messagesMetadataClient = await useMessageEmojiMetadataClient();
      const readEmoji = await requireEntity(
        getEntity(messagesMetadataClient, MessageEmojiMetadataEntity, input.partitionKey, input.rowKey),
        MessageMetadataType.Emoji,
        JSON.stringify(input),
      );
      if (readEmoji.userIds.length === 1 && readEmoji.userIds[0] === ctx.getSessionPayload.user.id)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Update, MessageMetadataType.Emoji, JSON.stringify(readEmoji))
            .message,
        });

      const updatedEmoji = { ...input, userIds: getUpdatedUserIds(readEmoji.userIds, ctx.getSessionPayload.user.id) };
      await updateEntity(messagesMetadataClient, updatedEmoji);
      emojiEventEmitter.emit("updateEmoji", [updatedEmoji, getDevice(ctx.getSessionPayload)]);
    },
  ),
});
