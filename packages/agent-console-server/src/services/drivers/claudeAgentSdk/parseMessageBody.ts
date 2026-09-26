import type { ContentBlock } from "#src/models/claudeAgentSdk/ContentBlock";
import type { MessageBody } from "#src/models/claudeAgentSdk/MessageBody";

import { z } from "zod";

const documentBlockSchema = z.object({ type: z.literal("document") }) satisfies z.ZodType<
  Extract<ContentBlock, { type: "document" }>
>;
const imageBlockSchema = z.object({ type: z.literal("image") }) satisfies z.ZodType<
  Extract<ContentBlock, { type: "image" }>
>;
const textBlockSchema = z.object({ text: z.string(), type: z.literal("text") }) satisfies z.ZodType<
  Extract<ContentBlock, { type: "text" }>
>;
const thinkingBlockSchema = z.object({ thinking: z.string(), type: z.literal("thinking") }) satisfies z.ZodType<
  Extract<ContentBlock, { type: "thinking" }>
>;
const toolResultBlockSchema = z.object({
  content: z.union([z.string(), z.looseObject({ text: z.string().optional(), type: z.string() }).array()]),
  is_error: z.boolean().optional(),
  tool_use_id: z.string().min(1),
  type: z.literal("tool_result"),
}) satisfies z.ZodType<Extract<ContentBlock, { type: "tool_result" }>>;
const toolUseBlockSchema = z.object({
  id: z.string().min(1),
  input: z.record(z.string(), z.unknown()),
  name: z.string().min(1),
  type: z.literal("tool_use"),
}) satisfies z.ZodType<Extract<ContentBlock, { type: "tool_use" }>>;
const otherBlockSchema = z
  .looseObject({ type: z.string() })
  .transform((block): Extract<ContentBlock, { type: "other" }> => ({
    blockType: block.type,
    raw: JSON.stringify(block),
    type: "other",
  }));
// A union rather than a discriminated one: the last member takes every type the others do not name
const contentBlockSchema = z.union([
  documentBlockSchema,
  imageBlockSchema,
  textBlockSchema,
  thinkingBlockSchema,
  toolResultBlockSchema,
  toolUseBlockSchema,
  otherBlockSchema,
]) satisfies z.ZodType<ContentBlock>;

const messageBodySchema = z.looseObject({ content: z.union([contentBlockSchema.array(), z.string()]) });
// The schemas stay behind this function: a published package's declarations would otherwise have to spell out every
// Block's Zod type by hand, for a shape nothing outside the driver reads
export const parseMessageBody = (value: unknown): MessageBody | undefined => {
  const result = messageBodySchema.safeParse(value);
  return result.success ? result.data : undefined;
};
