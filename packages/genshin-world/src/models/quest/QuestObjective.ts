import { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";
import { z } from "zod";

// One thing a step asks for, done once its targets have been met as many times as the count (the game's "0/3"). Its
// Targets are what the game's own condition names: a place, a resident or a thing for going and acting, a talk for
// Talking, an enemy for defeating and an item for collecting. An event meets it when it names any one of them, so a
// Collect of any of a food group names each of the group's items
export interface QuestObjective {
  count: number;
  kind: QuestObjectiveKind;
  targetIds: string[];
}

export const questObjectiveSchema = z.object({
  count: z.int().positive(),
  kind: z.enum(QuestObjectiveKind) satisfies z.ZodType<QuestObjectiveKind>,
  targetIds: z.array(z.string().min(1)).min(1),
}) satisfies z.ZodType<QuestObjective>;
