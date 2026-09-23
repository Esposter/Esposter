import { z } from "zod";

export interface TokenUsage {
  cacheCreationInputTokens: number;
  cacheReadInputTokens: number;
  inputTokens: number;
  outputTokens: number;
}

export const tokenUsageSchema: z.ZodObject<{
  cacheCreationInputTokens: z.ZodInt;
  cacheReadInputTokens: z.ZodInt;
  inputTokens: z.ZodInt;
  outputTokens: z.ZodInt;
}> = z.object({
  cacheCreationInputTokens: z.int().nonnegative(),
  cacheReadInputTokens: z.int().nonnegative(),
  inputTokens: z.int().nonnegative(),
  outputTokens: z.int().nonnegative(),
}) satisfies z.ZodType<TokenUsage>;
