import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { CustomTableClient } from "@@/server/models/azure/table/CustomTableClient";

import { selectRoomSchema } from "#shared/db/schema/rooms";
import { MessageMetadataType } from "#shared/models/db/message/metadata/MessageMetadataType";
import {
    MessageReplyMetadataEntity,
    MessageReplyMetadataEntityPropertyNames,
    messageReplyMetadataEntitySchema,
} from "#shared/models/db/message/metadata/MessageReplyMetadataEntity";
import { createCursorPaginationParamsSchema } from "#shared/models/pagination/cursor/CursorPaginationParams";
import { SortOrder } from "#shared/models/pagination/sorting/SortOrder";
import { useTableClient } from "@@/server/composables/azure/useTableClient";
import { AzureTable } from "@@/server/models/azure/table/AzureTable";
import { createEntity } from "@@/server/services/azure/table/createEntity";
import { getReverseTickedTimestamp } from "@@/server/services/azure/table/getReverseTickedTimestamp";
import { getTopNEntities } from "@@/server/services/azure/table/getTopNEntities";
import { replyEventEmitter } from "@@/server/services/esbabbler/events/replyEventEmitter";
import { getMessagesPartitionKeyFilter } from "@@/server/services/esbabbler/getMessagesPartitionKeyFilter";
import { isMessagesPartitionKeyForRoomId } from "@@/server/services/esbabbler/isMessagesPartitionKeyForRoomId";
import { on } from "@@/server/services/events/on";
import { getCursorPaginationData } from "@@/server/services/pagination/cursor/getCursorPaginationData";
import { getCursorWhereAzureTable } from "@@/server/services/pagination/cursor/getCursorWhere";
import { router } from "@@/server/trpc";
import { getProfanityFilterMiddleware } from "@@/server/trpc/middleware/getProfanityFilterMiddleware";
import { getRoomUserProcedure } from "@@/server/trpc/procedure/getRoomUserProcedure";
import { readMetadataInputSchema } from "@@/server/trpc/routers/message";
import { z } from "zod";

const readRepliesInputSchema = readMetadataInputSchema
  .extend(
    createCursorPaginationParamsSchema(messageReplyMetadataEntitySchema.keyof(), [
      { key: "createdAt", order: SortOrder.Desc },
    ]),
  )
  .omit({ sortBy: true });
export type ReadRepliesInput = z.infer<typeof readRepliesInputSchema>;

const onCreateReplyInputSchema = z.interface({ roomId: selectRoomSchema.shape.id });
export type OnCreateReplyInput = z.infer<typeof onCreateReplyInputSchema>;

const createReplyInputSchema = messageReplyMetadataEntitySchema.pick({
  message: true,
  messageRowKey: true,
  partitionKey: true,
});
export type CreateReplyInput = z.infer<typeof createReplyInputSchema>;

export const replyRouter = router({
  createReply: getRoomUserProcedure(createReplyInputSchema, "partitionKey")
    .use(getProfanityFilterMiddleware(createReplyInputSchema, ["message"]))
    .input(createReplyInputSchema)
    .mutation(async ({ input }) => {
      const messagesMetadataClient = await useTableClient(AzureTable.MessagesMetadata);
      const newReply = new MessageReplyMetadataEntity({
        ...input,
        rowKey: getReverseTickedTimestamp(),
        type: MessageMetadataType.Reply,
      });
      await createEntity(messagesMetadataClient, newReply);
      replyEventEmitter.emit("createReply", newReply);
    }),
  onCreateReply: getRoomUserProcedure(onCreateReplyInputSchema, "roomId")
    .input(onCreateReplyInputSchema)
    .subscription(async function* ({ input, signal }) {
      for await (const [data] of on(replyEventEmitter, "createReply", { signal }))
        if (isMessagesPartitionKeyForRoomId(data.partitionKey, input.roomId)) yield data;
    }),
  readReplies: getRoomUserProcedure(readRepliesInputSchema, "roomId")
    .input(readRepliesInputSchema)
    .query(async ({ input: { cursor, limit, messageRowKeys, roomId } }) => {
      const { messageRowKey, type } = MessageReplyMetadataEntityPropertyNames;
      const sortBy: SortItem<keyof MessageReplyMetadataEntity>[] = [{ key: "createdAt", order: SortOrder.Desc }];
      let filter = `${getMessagesPartitionKeyFilter(roomId)} and ${type} eq '${
        MessageMetadataType.Reply
      }' and (${messageRowKeys.map((mrk) => `${messageRowKey} eq '${mrk}'`).join(" or ")})`;
      if (cursor) filter += ` and ${getCursorWhereAzureTable(cursor, sortBy)}`;
      const messagesMetadataClient = (await useTableClient(
        AzureTable.MessagesMetadata,
      )) as CustomTableClient<MessageReplyMetadataEntity>;
      const replies = await getTopNEntities(messagesMetadataClient, limit + 1, MessageReplyMetadataEntity, { filter });
      return getCursorPaginationData(replies, limit, sortBy);
    }),
});
