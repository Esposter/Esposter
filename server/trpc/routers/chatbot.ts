import { router } from "@/server/trpc";
import { authedProcedure } from "@/server/trpc/procedure";
import { generateAIResponse } from "@/services/openai/chatbot";
import { CHATBOT_PROMPT_MAX_LENGTH } from "@/utils/validation";
import { z } from "zod";

const inferSchema = z.object({
  prompt: z.string().min(1).max(CHATBOT_PROMPT_MAX_LENGTH),
  welcomeMessage: z.string().optional().default("Hello! How can I help you today?"),
});
export type InferInput = z.infer<typeof inferSchema>;

export const chatbotRouter = router({
  infer: authedProcedure
    .input(inferSchema)
    .mutation(({ input: { prompt, welcomeMessage }, ctx }) =>
      generateAIResponse(ctx.session.user.id, prompt, welcomeMessage)
    ),
});
