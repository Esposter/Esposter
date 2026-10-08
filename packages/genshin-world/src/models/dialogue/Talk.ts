import type { TalkLine } from "#src/models/dialogue/TalkLine";

import { talkLineSchema } from "#src/models/dialogue/TalkLine";
import { createUniqueArraySchema } from "@esposter/shared";
import { z } from "zod";

// A conversation as the game holds it: a graph of lines from the one it starts at, where a line followed by the
// Traveler's replies offers them as choices and each reply leads on down its own branch
export interface Talk {
  id: string;
  lines: TalkLine[];
  startLineId: string;
}

export const talkSchema = z.object({
  id: z.string().min(1),
  lines: createUniqueArraySchema(talkLineSchema, "id"),
  startLineId: z.string().min(1),
}) satisfies z.ZodType<Talk>;
