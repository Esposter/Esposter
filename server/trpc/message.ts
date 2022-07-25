import { createRouter } from "@/server/trpc/createRouter";
import { getTableClient, getTopNEntities, submitTransaction } from "@/services/azure";
import type { AzureMessageEntity, MessageEntity } from "@/services/azure/types";
import { AzureTable } from "@/services/azure/types";
import { getFetchLimit, MESSAGE_MAX_LENGTH } from "@/util/constants";
import { RemoveIndexSignature } from "@/util/types";
import { odata } from "@azure/data-tables";
import { toZod } from "tozod";
import { z } from "zod";

const messageSchema: toZod<RemoveIndexSignature<MessageEntity>> = z.object({
  partitionKey: z.string(),
  rowKey: z.string(),
  userId: z.string(),
  message: z.string().min(1).max(MESSAGE_MAX_LENGTH),
  createdAt: z.date(),
});

const readMessagesInputSchema = messageSchema.pick({ partitionKey: true });
export type ReadMessagesInput = z.infer<typeof readMessagesInputSchema>;

const createMessageInputSchema = messageSchema.pick({ partitionKey: true, rowKey: true, message: true });
export type CreateMessageInput = z.infer<typeof createMessageInputSchema>;

export const messageRouter = createRouter()
  .query("readMessages", {
    input: readMessagesInputSchema,
    resolve: async ({ input: { partitionKey } }) => {
      const filter = odata`PartitionKey eq ${partitionKey}`;
      const fetchLimit = getFetchLimit();
      const messageClient = await getTableClient(AzureTable.Messages);
      const messages = await getTopNEntities<AzureMessageEntity>(messageClient, fetchLimit, { filter });
      const messageEntities: MessageEntity[] = [];

      for (const message of messages) messageEntities.push({ ...message, createdAt: new Date(message.createdAt) });

      return messageEntities;
    },
  })
  .mutation("createMessage", {
    input: createMessageInputSchema,
    resolve: async ({ input }) => {
      const messageClient = await getTableClient(AzureTable.Messages);
      // Auto create properties we know from the backend
      const message: MessageEntity = { ...input, userId: "1", createdAt: new Date() };
      const error = await submitTransaction(messageClient, [["create", message]]);
      if (error) return null;
      else return message;
    },
  });
