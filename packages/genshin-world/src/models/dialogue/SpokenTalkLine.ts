import type { BaseTalkLine } from "#src/models/dialogue/BaseTalkLine";

import { baseTalkLineSchema } from "#src/models/dialogue/BaseTalkLine";
import { TalkLineKind } from "#src/models/dialogue/TalkLineKind";
import { z } from "zod";

// A line said aloud: its speaker's name by text id, "" for a narration, and the voice-over the game files it under,
// "" for an unvoiced line
export interface SpokenTalkLine extends BaseTalkLine {
  kind: TalkLineKind.Spoken;
  speakerTextId: string;
  voiceId: string;
}

export const spokenTalkLineSchema = baseTalkLineSchema.safeExtend({
  kind: z.literal(TalkLineKind.Spoken),
  speakerTextId: z.string(),
  voiceId: z.string(),
}) satisfies z.ZodType<SpokenTalkLine>;
