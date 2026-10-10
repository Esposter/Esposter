import type { DumpedDialog } from "#src/models/genshinText/DumpedDialog";
import type { DumpedMainQuest } from "#src/models/genshinText/DumpedMainQuest";
import type { DumpedNpc } from "#src/models/genshinText/DumpedNpc";
import type { Quest } from "genshin-world";

import {
  DIALOG_PATH,
  MAIN_QUEST_PATH,
  NPC_PATH,
  QUEST_BINARY_DIRECTORY,
  QUEST_TEXT_DIRECTORY,
  QUESTS_DIRECTORY,
  SCRAMBLED_KEY_REGEX,
} from "#src/services/genshinText/constants";
import { DumpedQuestKindMap } from "#src/services/genshinText/DumpedQuestKindMap";
import { getPlainGameText } from "#src/services/genshinText/getPlainGameText";
import { readQuestSteps } from "#src/services/genshinText/readQuestSteps";
import { readTalk } from "#src/services/genshinText/readTalk";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { GameLanguage, GameLanguages } from "genshin-text";
import { QuestIds, QuestObjectiveKind, questSchema, TalkLineKind } from "genshin-world";
import { mkdirSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

// Every quest `QuestId` names, written into the world: its kind, title and description from the quest table, its shown
// Steps from its binary output, the talks its steps end on from the dialog table, and every word they show in every
// Language, the text missing from a language taking English's and saying so. Each quest is checked against the world's
// Own schema before it is written
export const writeQuests = (): string[] => {
  const notes: string[] = [];
  const englishTextMap = readTextMap(GameLanguage.English);
  const mainQuestMap = new Map(
    parseMachineJson<DumpedMainQuest[]>(readFileSync(MAIN_QUEST_PATH, "utf8")).map((mainQuest) => [
      mainQuest.id,
      mainQuest,
    ]),
  );
  const dialogRows = parseMachineJson<(DumpedDialog & Record<string, unknown>)[]>(readFileSync(DIALOG_PATH, "utf8"));
  const idKey = Object.keys(dialogRows[0] ?? {}).find((key) => SCRAMBLED_KEY_REGEX.test(key));
  if (!idKey) throw new InvalidOperationError(Operation.Read, DIALOG_PATH, "has no scrambled id field");
  const talkDialogsMap = Map.groupBy(
    dialogRows.map((dialog) => ({ dialog, id: Number(dialog[idKey]) })),
    ({ id }) => Math.floor(id / 100),
  );
  const npcNameTextIdMap = new Map(
    parseMachineJson<DumpedNpc[]>(readFileSync(NPC_PATH, "utf8")).map(({ id, nameTextMapHash }) => [
      String(id),
      String(nameTextMapHash),
    ]),
  );
  const quests: Quest[] = QuestIds.map((questId) => {
    const mainQuest = mainQuestMap.get(Number(questId));
    if (!mainQuest) throw new InvalidOperationError(Operation.Read, MAIN_QUEST_PATH, `has no quest ${questId}`);
    const questKind = DumpedQuestKindMap[mainQuest.type];
    if (!questKind) throw new InvalidOperationError(Operation.Read, questId, `has the unknown type ${mainQuest.type}`);
    const questBinary = parseMachineJson<Record<string, unknown>>(
      readFileSync(join(QUEST_BINARY_DIRECTORY, `${questId}.json`), "utf8"),
    );
    const { notes: stepNotes, steps } = readQuestSteps(questBinary, Number(questId), (hash) =>
      englishTextMap.has(String(hash)),
    );
    notes.push(...stepNotes);
    const talkIds = new Set(
      steps.flatMap(({ objectives }) =>
        objectives.filter(({ kind }) => kind === QuestObjectiveKind.TalkTo).map(({ targetId }) => Number(targetId)),
      ),
    );
    return questSchema.parse({
      descriptionTextId: String(mainQuest.descTextMapHash),
      id: questId,
      kind: questKind,
      steps,
      talks: Array.from(talkIds, (talkId) => readTalk(talkId, talkDialogsMap.get(talkId) ?? [], npcNameTextIdMap)),
      titleTextId: String(mainQuest.titleTextMapHash),
    });
  });
  const textIds = new Set(
    quests.flatMap(({ descriptionTextId, steps, talks, titleTextId }) => [
      descriptionTextId,
      titleTextId,
      ...steps.map(({ textId }) => textId),
      ...talks.flatMap(({ lines }) =>
        lines.flatMap((line) =>
          line.kind === TalkLineKind.Spoken ? [line.textId, line.speakerTextId] : [line.textId],
        ),
      ),
    ]),
  );
  textIds.delete("");
  // Every language is read before the last run's files are removed, so a text map that fails to read leaves them
  const languageQuestTexts = GameLanguages.map((language) => {
    const textMap = language === GameLanguage.English ? englishTextMap : readTextMap(language);
    const questText = Object.fromEntries(
      [...textIds].toSorted().map((textId) => {
        const text = textMap.get(textId);
        if (!text) notes.push(`${textId} has no ${language} text; English stands in`);
        return [textId, getPlainGameText(text || (englishTextMap.get(textId) ?? ""))];
      }),
    );
    return [language, questText] as const;
  });
  for (const directory of [QUESTS_DIRECTORY, QUEST_TEXT_DIRECTORY]) {
    rmSync(directory, { force: true, recursive: true });
    mkdirSync(directory, { recursive: true });
  }

  for (const quest of quests) writeJsonFile(join(QUESTS_DIRECTORY, `${quest.id}.json`), quest);
  for (const [language, questText] of languageQuestTexts)
    writeJsonFile(join(QUEST_TEXT_DIRECTORY, `${language}.json`), questText);

  notes.push(
    `${quests.length} quests, and ${textIds.size} of their words, written in ${GameLanguages.length} languages`,
  );
  return notes;
};
