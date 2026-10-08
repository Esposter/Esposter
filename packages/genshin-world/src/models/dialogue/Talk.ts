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

// Every line it starts at or leads on to is one it holds, so a talk never breaks partway through
export const talkSchema = z
  .object({
    id: z.string().min(1),
    lines: createUniqueArraySchema(talkLineSchema, "id"),
    startLineId: z.string().min(1),
  })
  .refine(({ lines, startLineId }) => {
    const lineIds = new Set(lines.map(({ id }) => id));
    return [startLineId, ...lines.flatMap(({ nextLineIds }) => nextLineIds)].every((lineId) => lineIds.has(lineId));
  }, "Talk line ids must name lines the talk holds") satisfies z.ZodType<Talk>;
