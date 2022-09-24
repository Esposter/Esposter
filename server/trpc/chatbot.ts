import { z } from "zod";
import { createRouter } from "@/server/trpc/createRouter";
import { generateAIResponse } from "@/services/chatbot";
import { CHATBOT_PROMPT_MAX_LENGTH } from "@/util/constants";

const inferSchema = z.object({
  userId: z.string().uuid(),
  prompt: z.string().min(1).max(CHATBOT_PROMPT_MAX_LENGTH),
  welcomeMessage: z.string().optional().default("Hello! How can I help you today?"),
});
export type InferInput = z.infer<typeof inferSchema>;

export const chatbotRouter = createRouter().mutation("infer", {
  input: inferSchema,
  resolve: ({ input: { userId, prompt, welcomeMessage } }) => generateAIResponse(userId, prompt, welcomeMessage),
});
