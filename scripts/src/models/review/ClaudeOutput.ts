import { z } from "zod";

// The envelope `claude -p --output-format json` prints around a session's answer: the answer's text is its `result`
export interface ClaudeOutput {
  result: string;
}

export const claudeOutputSchema: z.ZodType<ClaudeOutput> = z.object({ result: z.string() });
