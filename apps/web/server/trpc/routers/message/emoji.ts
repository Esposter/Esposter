import type { Clause } from "@esposter/azure";

import { useMessageEmojiMetadataClient } from "#server/composables/azure/table/useMessageEmojiMetadataClient";
import { getDevice } from "#server/services/auth/getDevice";
import { updateEntityConditionally } from "#server/services/azure/table/updateEntityConditionally";
import { getEmojiMetadataClauses } from "#server/services/message/emoji/getEmojiMetadataClauses";
import { emojiEventEmitter } from "#server/services/message/events/emojiEventEmitter";
import { router } from "#server/trpc";
import { getInvalidOperationError } from "#server/trpc/guards/getInvalidOperationError";
import { requireEntity } from "#server/trpc/guards/requireEntity";
import { getMemberProcedure } from "#server/trpc/procedure/room/getMemberProcedure";
import { getRoomEventSubscription } from "#server/trpc/procedure/room/getRoomEventSubscription";
import { createEmojiInputSchema } from "#shared/models/db/message/metadata/CreateEmojiInput";
import { deleteEmojiInputSchema } from "#shared/models/db/message/metadata/DeleteEmojiInput";
import {
  MessageEmojiMetadataEntity,
  MessageEmojiMetadataEntityPropertyNames,
} from "#shared/models/db/message/metadata/MessageEmojiMetadataEntity";
import { updateEmojiInputSchema } from "#shared/models/db/message/metadata/UpdateEmojiInput";
import { readMetadataInputSchema } from "#shared/models/db/message/ReadMetadataInput";
import { createMessageEmojiMetadataEntity } from "#shared/services/message/createMessageEmojiMetadataEntity";
import { AZURE_MAX_PAGE_SIZE, BinaryOperator, CompositeKeyPropertyNames, serializeClauses } from "@esposter/azure";
import { createEntity, getEntityWithEtag, getTopNEntities, updateEntity } from "@esposter/db";
import { MessageMetadataType } from "@esposter/db-schema";
import { checkIsOnlyReactor, getUpdatedUserIds, Operation } from "@esposter/shared";

export const emojiRouter = router({
  createEmoji: getMemberProcedure(
    createEmojiInputSchema,
    CompositeKeyPropertyNames.partitionKey,
  ).mutation<MessageEmojiMetadataEntity>(async ({ ctx, input }) => {
    const messagesMetadataClient = await useMessageEmojiMetadataClient();
    const clauses: Clause<MessageEmojiMetadataEntity>[] = [
      ...getEmojiMetadataClauses(input.partitionKey),
      {
        key: MessageEmojiMetadataEntityPropertyNames.messageRowKey,
        operator: BinaryOperator.Eq,
        value: input.messageRowKey,
      },
      { key: MessageEmojiMetadataEntityPropertyNames.emojiTag, operator: BinaryOperator.Eq, value: input.emojiTag },
    ];
    const existingEmoji = (
      await getTopNEntities(messagesMetadataClient, 1, MessageEmojiMetadataEntity, {
        filter: serializeClauses(clauses),
      })
    )[0];
    if (existingEmoji)
      throw getInvalidOperationError(Operation.Create, MessageMetadataType.Emoji, JSON.stringify(existingEmoji));

    const newEmoji = createMessageEmojiMetadataEntity({ ...input, userIds: [ctx.getSessionPayload.user.id] });
    await createEntity(messagesMetadataClient, newEmoji);
    emojiEventEmitter.emit("createEmoji", [newEmoji, getDevice(ctx.getSessionPayload)]);
    return newEmoji;
  }),
  deleteEmoji: getMemberProcedure(deleteEmojiInputSchema, CompositeKeyPropertyNames.partitionKey).mutation<void>(
    async ({ ctx, input }) => {
      const messagesMetadataClient = await useMessageEmojiMetadataClient();
      const { entity: existingEmoji, etag } = await requireEntity(
        getEntityWithEtag(messagesMetadataClient, MessageEmojiMetadataEntity, input.partitionKey, input.rowKey),
        MessageMetadataType.Emoji,
        JSON.stringify(input),
      );
      if (!checkIsOnlyReactor(existingEmoji.userIds, ctx.getSessionPayload.user.id))
        throw getInvalidOperationError(Operation.Delete, MessageMetadataType.Emoji, JSON.stringify(input));
      // Conditional on the version read, so a member who reacts between the check and the delete keeps their
      // Reaction rather than losing it with the row
      await messagesMetadataClient.deleteEntity(input.partitionKey, input.rowKey, { etag });
      emojiEventEmitter.emit("deleteEmoji", [input, getDevice(ctx.getSessionPayload)]);
    },
  ),
  onCreateEmoji: getRoomEventSubscription(emojiEventEmitter, "createEmoji", ({ partitionKey }) => partitionKey),
  onDeleteEmoji: getRoomEventSubscription(emojiEventEmitter, "deleteEmoji", ({ partitionKey }) => partitionKey),
  onUpdateEmoji: getRoomEventSubscription(emojiEventEmitter, "updateEmoji", ({ partitionKey }) => partitionKey),
  readEmojis: getMemberProcedure(readMetadataInputSchema, "roomId").query<MessageEmojiMetadataEntity[]>(
    async ({ input: { messageRowKeys, roomId } }) => {
      const messagesMetadataClient = await useMessageEmojiMetadataClient();
      const clauses: Clause<MessageEmojiMetadataEntity>[] = [
        ...getEmojiMetadataClauses(roomId),
        ...messageRowKeys.map((messageRowKey) => ({
          key: MessageEmojiMetadataEntityPropertyNames.messageRowKey,
          operator: BinaryOperator.Eq,
          value: messageRowKey,
        })),
      ];
      return getTopNEntities(messagesMetadataClient, AZURE_MAX_PAGE_SIZE, MessageEmojiMetadataEntity, {
        filter: serializeClauses(clauses),
      });
    },
  ),
  updateEmoji: getMemberProcedure(updateEmojiInputSchema, CompositeKeyPropertyNames.partitionKey).mutation<void>(
    async ({ ctx, input }) => {
      const messagesMetadataClient = await useMessageEmojiMetadataClient();
      // Two members reacting at once each read the same user list, so the toggle is computed against the version it
      // Was read from and written only if that version still stands. A lost race reads again and toggles again
      const existingEmojiWithEtag = await requireEntity(
        getEntityWithEtag(messagesMetadataClient, MessageEmojiMetadataEntity, input.partitionKey, input.rowKey),
        MessageMetadataType.Emoji,
        JSON.stringify(input),
      );
      const updatedEmoji = await updateEntityConditionally(messagesMetadataClient, MessageEmojiMetadataEntity, {
        entityType: MessageMetadataType.Emoji,
        entityWithEtag: existingEmojiWithEtag,
        getUpdateEntity: (existingEmoji) => {
          if (checkIsOnlyReactor(existingEmoji.userIds, ctx.getSessionPayload.user.id))
            throw getInvalidOperationError(Operation.Update, MessageMetadataType.Emoji, JSON.stringify(existingEmoji));

          // The row's own message: the input names the reaction alone, so a caller has no message to move it onto
          return {
            messageRowKey: existingEmoji.messageRowKey,
            partitionKey: input.partitionKey,
            rowKey: input.rowKey,
            userIds: getUpdatedUserIds(existingEmoji.userIds, ctx.getSessionPayload.user.id),
          };
        },
        writeEntity: (entity, etag) => updateEntity(messagesMetadataClient, entity, undefined, { etag }),
      });
      emojiEventEmitter.emit("updateEmoji", [updatedEmoji, getDevice(ctx.getSessionPayload)]);
    },
  ),
});
