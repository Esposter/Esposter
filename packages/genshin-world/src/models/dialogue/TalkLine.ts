import type { ChoiceTalkLine } from "#src/models/dialogue/ChoiceTalkLine";
import type { SpokenTalkLine } from "#src/models/dialogue/SpokenTalkLine";

import { choiceTalkLineSchema } from "#src/models/dialogue/ChoiceTalkLine";
import { spokenTalkLineSchema } from "#src/models/dialogue/SpokenTalkLine";
import { z } from "zod";

export type TalkLine = ChoiceTalkLine | SpokenTalkLine;

export const talkLineSchema = z.discriminatedUnion("kind", [
  choiceTalkLineSchema,
  spokenTalkLineSchema,
]) satisfies z.ZodType<TalkLine>;
