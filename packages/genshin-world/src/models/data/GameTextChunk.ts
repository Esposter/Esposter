import { z } from "zod";

// A language's words for one dataset: the game's string for each text id it references
export type GameTextChunk = Record<string, string>;

export const gameTextChunkSchema = z.record(z.string(), z.string()) satisfies z.ZodType<GameTextChunk>;
