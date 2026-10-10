import { z } from "zod";

// The fields a usage or prompt read takes from one transcript line, every other field left out
export interface TranscriptLine {
  message?: {
    content?: unknown;
    id?: string;
    model?: string;
    usage?: {
      cache_creation_input_tokens?: number;
      cache_read_input_tokens?: number;
      input_tokens?: number;
      output_tokens?: number;
    };
  };
  requestId?: string;
  timestamp?: string;
  type?: string;
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
