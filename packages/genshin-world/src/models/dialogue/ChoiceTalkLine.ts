import type { BaseTalkLine } from "#src/models/dialogue/BaseTalkLine";

import { baseTalkLineSchema } from "#src/models/dialogue/BaseTalkLine";
import { TalkLineKind } from "#src/models/dialogue/TalkLineKind";
import { DialogueChoiceIcon } from "genshin-interface";
import { z } from "zod";

// One of the Traveler's replies, offered with the mark the game draws beside it
export interface ChoiceTalkLine extends BaseTalkLine {
  icon: DialogueChoiceIcon;
  kind: TalkLineKind.Choice;
}

export const choiceTalkLineSchema = baseTalkLineSchema.safeExtend({
  icon: z.enum(DialogueChoiceIcon) satisfies z.ZodType<DialogueChoiceIcon>,
  kind: z.literal(TalkLineKind.Choice),
}) satisfies z.ZodType<ChoiceTalkLine>;
