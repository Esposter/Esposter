import { z } from "zod";

// An index object: the sha256 of each entry's record, keyed by the entry's id
export type GameDataIndex = Record<string, string>;

export const gameDataIndexSchema = z.record(z.string(), z.hash("sha256")) satisfies z.ZodType<GameDataIndex>;
