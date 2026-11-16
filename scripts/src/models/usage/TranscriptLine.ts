import { z } from "zod";

// The fields a usage or prompt read takes from one transcript line, every other field left out
export interface TranscriptLine {
  message?:
    | undefined
    | {
        content?: unknown;
        id?: string | undefined;
        model?: string | undefined;
        usage?:
          | undefined
          | {
              cache_creation_input_tokens?: number | undefined;
              cache_read_input_tokens?: number | undefined;
              input_tokens?: number | undefined;
              output_tokens?: number | undefined;
            };
      };
  requestId?: string | undefined;
  timestamp?: string | undefined;
  type?: string | undefined;
}

export const transcriptLineSchema: z.ZodType<TranscriptLine> = z.object({
  message: z
    .object({
      content: z.unknown().optional(),
      id: z.string().optional(),
      model: z.string().optional(),
      usage: z
        .object({
          cache_creation_input_tokens: z.number().optional(),
          cache_read_input_tokens: z.number().optional(),
          input_tokens: z.number().optional(),
          output_tokens: z.number().optional(),
        })
        .optional(),
    })
    .optional(),
  requestId: z.string().optional(),
  timestamp: z.string().optional(),
  type: z.string().optional(),
});
