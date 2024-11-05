import type { CustomTableClient } from "@/server/models/azure/table/CustomTableClient";

import { selectRoomSchema } from "@/server/db/schema/rooms";
import { AzureTable } from "@/server/models/azure/table/AzureTable";
import { AZURE_MAX_PAGE_SIZE } from "@/server/services/azure/table/constants";
import { createEntity } from "@/server/services/azure/table/createEntity";
import { getTopNEntities } from "@/server/services/azure/table/getTopNEntities";
import { replyEventEmitter } from "@/server/services/esbabbler/events/replyEventEmitter";
import { getMessagesPartitionKeyFilter } from "@/server/services/esbabbler/getMessagesPartitionKeyFilter";
import { router } from "@/server/trpc";
import { getProfanityFilterMiddleware } from "@/server/trpc/middleware/getProfanityFilterMiddleware";
import { getRoomUserProcedure } from "@/server/trpc/procedure/getRoomUserProcedure";
import { readMetadataInputSchema } from "@/server/trpc/routers/message";
import { MessageMetadataType } from "@/shared/models/esbabbler/message/metadata";
import {
  MessageReplyMetadataEntity,
  MessageReplyMetadataEntityPropertyNames,
  messageReplyMetadataSchema,
} from "@/shared/models/esbabbler/message/metadata/reply";
import { now } from "@/util/time/now";
import { observable } from "@trpc/server/observable";
import { z } from "zod";

const onCreateReplyInputSchema = z.object({ roomId: selectRoomSchema.shape.id });
export type OnCreateReplyInput = z.infer<typeof onCreateReplyInputSchema>;

const createReplyInputSchema = messageReplyMetadataSchema.pick({
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
      const createdAt = new Date();
      const newReply = new MessageReplyMetadataEntity({
        ...input,
        createdAt,
        rowKey: now(),
        type: MessageMetadataType.Reply,
        updatedAt: createdAt,
      });
      await createEntity(messagesMetadataClient, newReply);
      replyEventEmitter.emit("createReply", newReply);
      return newReply;
    }),
  onCreateReply: getRoomUserProcedure(onCreateReplyInputSchema, "roomId")
    .input(onCreateReplyInputSchema)
    .subscription(({ input }) =>
      observable<MessageReplyMetadataEntity>((emit) => {
        const onCreateReply = (data: MessageReplyMetadataEntity) => () => {
          if (data.partitionKey.startsWith(input.roomId)) emit.next(data);
        };
        replyEventEmitter.on("createReply", onCreateReply);
        return () => replyEventEmitter.off("createReply", onCreateReply);
      }),
    ),
  readReplies: getRoomUserProcedure(readMetadataInputSchema, "roomId")
    .input(readMetadataInputSchema)
    .query(async ({ input: { messageRowKeys, roomId } }) => {
      const messagesMetadataClient = (await useTableClient(
        AzureTable.MessagesMetadata,
      )) as CustomTableClient<MessageReplyMetadataEntity>;
      const { messageRowKey, type } = MessageReplyMetadataEntityPropertyNames;
      return getTopNEntities(messagesMetadataClient, AZURE_MAX_PAGE_SIZE, MessageReplyMetadataEntity, {
        filter: `${getMessagesPartitionKeyFilter(roomId)} and ${type} eq '${
          MessageMetadataType.Reply
        }' and (${messageRowKeys.map((mrk) => `${messageRowKey} eq '${mrk}'`).join(" or ")})`,
      });
    }),
});
