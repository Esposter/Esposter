import { z } from "zod";

// One language's words of a text dataset, each keyed by its text id
export type TextChunk = Readonly<Record<string, string>>;

export const textChunkSchema = z.record(z.string(), z.string()) satisfies z.ZodType<TextChunk>;
