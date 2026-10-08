import type { DumpedQuestCondition } from "#src/models/genshinText/DumpedQuestCondition";

// The conditions a field of a sub quest holds, read by their shape since the dump scrambles every name: each an object
// Carrying a quest content type's code and an array of its parameters. Anything else holds none
export const readQuestConditions = (field: unknown): DumpedQuestCondition[] => {
  if (!Array.isArray(field)) return [];
  return field.flatMap((item: unknown) => {
    if (typeof item !== "object" || item === null) return [];
    const values = Object.values(item);
    const type = values.find((value) => typeof value === "string" && value.startsWith("QUEST_CONTENT_"));
    const parameters = values.find((value) => Array.isArray(value));
    return typeof type === "string" && Array.isArray(parameters) ? [{ parameters, type }] : [];
  });
};
