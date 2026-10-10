import { z } from "zod";

const promptBlockSchema = z.object({ text: z.string(), type: z.literal("text") });

// The text of a user message: a plain string, or the first text block of a list that may open with tool results
export const getUserPromptText = (content: unknown): string | undefined => {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return undefined;
  for (const block of content) {
    const parsedBlock = promptBlockSchema.safeParse(block);
    if (parsedBlock.success) return parsedBlock.data.text;
  }
  return undefined;
};
