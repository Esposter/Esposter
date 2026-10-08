import type { QuestStep } from "genshin-world";

import { QuestContentObjectiveMap } from "#src/services/genshinText/QuestContentObjectiveMap";
import { readQuestConditions } from "#src/services/genshinText/readQuestConditions";
import { QuestObjectiveKind } from "genshin-world";

// A quest's shown steps in order, read off its file in the dump's binary output by shape, since the dump scrambles every
// Field's name each patch. Its sub quests are the array whose items hold conditions; a step's id is the number in its
// Quest's hundred; its order the field numbering the steps from one; its finish conditions the list the most steps
// Fill, where its fail conditions are a list only some do; and its words the field holding a hash the text map has. A step
// With no words is the game's own bookkeeping, never shown, and one whose conditions ask nothing of the Traveler is
// Left out and noted. A step's objective is its first condition that asks something, since a step finishing on any of
// Several places lists each
export const readQuestSteps = (
  questBinary: Record<string, unknown>,
  questId: number,
  checkIsText: (hash: number) => boolean,
): { notes: string[]; steps: QuestStep[] } => {
  const subQuests = Object.values(questBinary).find(
    (field): field is Record<string, unknown>[] =>
      Array.isArray(field) &&
      field.length > 0 &&
      field.every(
        (item) =>
          typeof item === "object" &&
          item !== null &&
          Object.values(item).some((value) => readQuestConditions(value).length > 0),
      ),
  );
  if (!subQuests) return { notes: [`${questId} has no sub quests`], steps: [] };
  const conditionKeys = subQuests.flatMap((subQuest) =>
    Object.keys(subQuest).filter((key) => readQuestConditions(subQuest[key]).length > 0),
  );
  const countConditionKey = (key: string) => conditionKeys.filter((conditionKey) => conditionKey === key).length;
  const finishKey = conditionKeys.toSorted(
    (firstKey, secondKey) => countConditionKey(secondKey) - countConditionKey(firstKey),
  )[0];
  const orderKey = Object.keys(subQuests[0] ?? {}).find((key) =>
    subQuests
      .map((subQuest) => subQuest[key])
      .toSorted((firstOrder, secondOrder) => Number(firstOrder) - Number(secondOrder))
      .every((order, index) => order === index + 1),
  );
  const notes: string[] = [];
  const steps = subQuests
    .toSorted((firstSubQuest, secondSubQuest) =>
      orderKey ? Number(firstSubQuest[orderKey]) - Number(secondSubQuest[orderKey]) : 0,
    )
    .flatMap((subQuest) => {
      const numbers = Object.values(subQuest).filter((value) => typeof value === "number");
      const id = numbers.find((value) => Math.floor(value / 100) === questId);
      const textHash = numbers.find((value) => checkIsText(value));
      if (id === undefined || textHash === undefined) return [];
      const objectives = readQuestConditions(finishKey ? subQuest[finishKey] : []).flatMap(({ parameters, type }) => {
        const questContentObjective = QuestContentObjectiveMap[type];
        if (!questContentObjective) return [];
        const { kind, targetIndex } = questContentObjective;
        const isCounted = [QuestObjectiveKind.Collect, QuestObjectiveKind.Defeat].includes(kind);
        return [
          {
            count: isCounted ? Math.max(Number(parameters[1] ?? 0), 1) : 1,
            kind,
            targetId: String(parameters[targetIndex] ?? ""),
          },
        ];
      });
      if (objectives.length === 0) {
        notes.push(`${questId}'s step ${id} asks nothing of the Traveler its conditions name`);
        return [];
      }
      return [{ id: String(id), objectives: objectives.slice(0, 1), textId: String(textHash) }];
    });
  return { notes, steps };
};
