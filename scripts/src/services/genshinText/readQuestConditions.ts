import type { DumpedQuestCondition } from "#src/models/genshinText/DumpedQuestCondition";

// The conditions a field of a sub quest holds, read by their shape since the dump scrambles every name: each an object
// Carrying a condition type's code, starting with the prefix (a step's quest content by default, an accept condition's
// QUEST_COND_), and an array of its parameters. Anything else holds none
export const readQuestConditions = (field: unknown, typePrefix = "QUEST_CONTENT_"): DumpedQuestCondition[] => {
  if (!Array.isArray(field)) return [];
  return field.flatMap((item: unknown) => {
    if (typeof item !== "object" || item === null) return [];
    const values = Object.values(item);
    const type = values.find((value) => typeof value === "string" && value.startsWith(typePrefix));
    const parameters = values.find((value) => Array.isArray(value));
    return typeof type === "string" && Array.isArray(parameters) ? [{ parameters, type }] : [];
  });
};
