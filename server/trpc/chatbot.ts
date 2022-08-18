import { createRouter } from "@/server/trpc/createRouter";
import { getQueueClient, sendMessage } from "@/services/azure/queue";
import { AzureQueue } from "@/services/azure/types";
import { CHATBOT_PROMPT_MAX_LENGTH } from "@/util/constants";
import { z } from "zod";

const inferSchema = z.object({
  userId: z.string().uuid(),
  welcomeMessage: z.string().optional(),
  prompt: z.string().min(1).max(CHATBOT_PROMPT_MAX_LENGTH),
});
export type InferInput = z.infer<typeof inferSchema>;

export const chatbotRouter = createRouter().mutation("infer", {
  input: inferSchema,
  resolve: async ({ input }) => {
    const queueClient = await getQueueClient(AzureQueue.AIChatbotPendingMessageReplies);
    return sendMessage(queueClient, JSON.stringify(input));
  },
});
