import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { z } from "zod";

// One thing a step asks for, done once its target has been met as many times as the count (the game's "0/3"). The
// Target is what the game's own condition names: a place, a resident or a thing for going and acting, a talk for
// Talking, an enemy for defeating and an item for collecting. A collect any one of a group's items meets names the
// Group's other items in `alternativeTargetIds`
export interface QuestObjective {
  alternativeTargetIds?: string[];
  count: number;
  kind: QuestObjectiveKind;
  targetId: string;
}

export const questObjectiveSchema = z.object({
  alternativeTargetIds: z.array(z.string().min(1)).min(1).optional(),
  count: z.int().positive(),
  kind: z.enum(QuestObjectiveKind) satisfies z.ZodType<QuestObjectiveKind>,
  targetId: z.string().min(1),
}) satisfies z.ZodType<QuestObjective>;
