import type { QuestStep } from "genshin-world";

import { QuestContentObjectiveMap } from "#src/services/genshinText/QuestContentObjectiveMap";
import { readQuestBanType } from "#src/services/genshinText/readQuestBanType";
import { readQuestConditions } from "#src/services/genshinText/readQuestConditions";
import { QuestBanType, QuestObjectiveKind } from "genshin-world";

// A quest's shown steps in order, and the talks offering it, read off its file in the dump's binary output by shape,
// Since the dump scrambles every field's name each patch. Its sub quests are the array whose items hold conditions; a
// Step's id is the number in its quest's hundred; its order the field numbering the steps from one; its finish
// Conditions the list the most steps fill, where its fail conditions are a list only some do; and its words the field
// Holding a hash the text map has. A step with no words is the game's own bookkeeping, never shown, and one whose
// Conditions ask nothing of the Traveler is left out and noted. A step's objectives are every condition that asks
// Something, all of which the step needs done. A quest a talk offers opens on such a hidden step finishing on that talk,
// So the talks the first step finishes on offer the quest when that step has no words
export const readQuestSteps = (
  questBinary: Record<string, unknown>,
  questId: number,
  checkIsText: (hash: number) => boolean,
  checkIsPlayableTalk: (talkId: string) => boolean = () => true,
): { notes: string[]; offerTalkIds: string[]; steps: QuestStep[] } => {
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
  if (!subQuests) return { notes: [`${questId} has no sub quests`], offerTalkIds: [], steps: [] };
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
  const readTextHash = (subQuest: Record<string, unknown>) =>
    Object.values(subQuest).find((value): value is number => typeof value === "number" && checkIsText(value));
  const readFinishConditions = (subQuest: Record<string, unknown>) =>
    readQuestConditions(finishKey ? subQuest[finishKey] : []);
  const sortedSubQuests = subQuests.toSorted((firstSubQuest, secondSubQuest) =>
    orderKey ? Number(firstSubQuest[orderKey]) - Number(secondSubQuest[orderKey]) : 0,
  );
  const [firstSubQuest] = sortedSubQuests;
  const notes: string[] = [];
  // A talk the dump holds no lines for is a scripted performance, which the Traveler takes no part in, so it is left out
  const checkTalkIsPlayable = (talkId: string): boolean => {
    if (checkIsPlayableTalk(talkId)) return true;
    notes.push(`${questId}'s talk ${talkId} holds no lines in the dump, a scripted performance, so it is left out`);
    return false;
  };
  const offerTalkIds =
    firstSubQuest && readTextHash(firstSubQuest) === undefined
      ? readFinishConditions(firstSubQuest).flatMap(({ parameters, type }) => {
          const questContentObjective = QuestContentObjectiveMap[type];
          if (questContentObjective?.kind !== QuestObjectiveKind.TalkTo) return [];
          const talkId = String(parameters[questContentObjective.targetIndex] ?? "");
          return checkTalkIsPlayable(talkId) ? [talkId] : [];
        })
      : [];
  const steps = sortedSubQuests.flatMap((subQuest) => {
    const numbers = Object.values(subQuest).filter((value) => typeof value === "number");
    const id = numbers.find((value) => Math.floor(value / 100) === questId);
    const textHash = readTextHash(subQuest);
    if (id === undefined || textHash === undefined) return [];
    const objectives = readFinishConditions(subQuest).flatMap(({ parameters, type }) => {
      const questContentObjective = QuestContentObjectiveMap[type];
      if (!questContentObjective) return [];
      const { kind, targetIndex } = questContentObjective;
      const targetId = String(parameters[targetIndex] ?? "");
      if (kind === QuestObjectiveKind.TalkTo && !checkTalkIsPlayable(targetId)) return [];
      const isCounted = [QuestObjectiveKind.Collect, QuestObjectiveKind.Defeat].includes(kind);
      return [{ count: isCounted ? Math.max(Number(parameters[1] ?? 0), 1) : 1, kind, targetId }];
    });
    if (objectives.length === 0) {
      notes.push(`${questId}'s step ${id} asks nothing of the Traveler its conditions name`);
      return [];
    }
    const banGroup = readQuestBanType(subQuest);
    const banType = Object.values(QuestBanType).find((member) => member === banGroup);
    if (banGroup !== undefined && banType === undefined)
      notes.push(`${questId}'s step ${id} names a ban group the reader does not know, ${banGroup}, so it is left off`);
    return [{ ...(banType === undefined ? {} : { banType }), id: String(id), objectives, textId: String(textHash) }];
  });
  return { notes, offerTalkIds, steps };
};
