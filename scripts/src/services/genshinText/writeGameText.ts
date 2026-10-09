import type { VoiceLine } from "genshin-persona/src/models/VoiceLine.ts";

import {
  CHARACTER_LINES_DIRECTORY,
  GENSHIN_TEXT_GENERATED_DIRECTORY,
  GENSHIN_TEXT_SOURCE_DIRECTORY,
  PERSONA_COPY_DIRECTORY,
  PersonaCopiedModules,
} from "#src/services/genshinText/constants";
import { getCharacterLinesLoaderMapSource } from "#src/services/genshinText/getCharacterLinesLoaderMapSource";
import { getGameTextHash } from "#src/services/genshinText/getGameTextHash";
import { getGameTextLoaderMapSource } from "#src/services/genshinText/getGameTextLoaderMapSource";
import { getInterfaceGameText } from "#src/services/genshinText/getInterfaceGameText";
import { getPersonaModuleSource } from "#src/services/genshinText/getPersonaModuleSource";
import { getVoiceLines } from "#src/services/genshinText/getVoiceLines";
import { readManualTextMap } from "#src/services/genshinText/readManualTextMap";
import { readSdkText } from "#src/services/genshinText/readSdkText";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { readVoiceLineFetters } from "#src/services/genshinText/readVoiceLineFetters";
import { writeJsonFile } from "#src/services/shared/writeJsonFile";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { readGenshinDb } from "genshin-persona/src/services/readGenshinDb.ts";
import { GameLanguage, GameLanguages, GameTextKeys } from "genshin-text";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

// Every string `GameTextKey` names, in every language, into `genshin-text`; the lines of every character the
// Game-data package has none for yet, in every language, into the persona; and the persona's copy of the modules
// It runs. A key the account kit files is read from the kit's strings, every other from the text map, its colour tags
// Kept for the screen to draw. A key missing from one language's strings shows English there and says so, since a
// Dump that lost a string is the dump's fault rather than a reason to ship none
export const writeGameText = (): string[] => {
  const notes: string[] = [];
  const manualTextMap = readManualTextMap();
  const ids = GameTextKeys.toSorted();
  const englishSdkText = readSdkText(GameLanguage.English);
  const idHashMap = new Map(
    ids.filter((id) => !englishSdkText.has(id)).map((id) => [id, getGameTextHash(id, manualTextMap)]),
  );
  const idFettersMap = readVoiceLineFetters();
  const genshinDb = readGenshinDb();
  const unvoicedCharacters = genshinDb
    .characters("names", { matchCategories: true })
    .filter((name) => !genshinDb.voiceovers(name)?.friendLines.length)
    .toSorted()
    .flatMap((name) => {
      const id = genshinDb.characters(name)?.id;
      if (id === undefined) {
        notes.push(`${name} has no id in the data package; its lines are skipped`);
        return [];
      }
      return [{ id, name }];
    });
  const englishTextMap = readTextMap(GameLanguage.English);
  // Every language is read before the last run's files are removed, so a text map that fails to read leaves them
  const languageOutputs = GameLanguages.map((language) => {
    const textMap = language === GameLanguage.English ? englishTextMap : readTextMap(language);
    if (textMap.size === 0)
      throw new InvalidOperationError(Operation.Read, language, "has no text map in the dump: download it first");

    const sdkText = language === GameLanguage.English ? englishSdkText : readSdkText(language);
    const gameText = Object.fromEntries(
      ids.map((id) => {
        if (englishSdkText.has(id)) {
          const text = sdkText.get(id);
          if (!text) notes.push(`${id} has no ${language} text; English stands in`);
          return [id, text || (englishSdkText.get(id) ?? "")];
        }
        const hash = idHashMap.get(id) ?? "";
        const text = textMap.get(hash);
        if (!text) notes.push(`${id} has no ${language} text; English stands in`);
        return [id, getInterfaceGameText(text || (englishTextMap.get(hash) ?? ""))];
      }),
    );
    // A character the game has no lines for yet either — announced, not yet out — is left out rather than written
    // Empty, which reads the same and costs nothing
    const characterLines: Record<string, VoiceLine[]> = Object.fromEntries(
      unvoicedCharacters
        .map(({ id, name }) => [name, getVoiceLines(idFettersMap.get(id) ?? [], textMap)] as const)
        .filter(([, voiceLines]) => voiceLines.length > 0),
    );
    return { characterLines, gameText, language };
  });
  const textDirectory = join(GENSHIN_TEXT_GENERATED_DIRECTORY, "text");
  const copyTextDirectory = join(PERSONA_COPY_DIRECTORY, "generated", "text");
  for (const directory of [textDirectory, CHARACTER_LINES_DIRECTORY, PERSONA_COPY_DIRECTORY])
    rmSync(directory, { force: true, recursive: true });
  for (const directory of [textDirectory, CHARACTER_LINES_DIRECTORY, copyTextDirectory])
    mkdirSync(directory, { recursive: true });

  let voicedCount = 0;
  for (const { characterLines, gameText, language } of languageOutputs) {
    writeJsonFile(join(textDirectory, `${language}.json`), gameText);
    writeJsonFile(join(copyTextDirectory, `${language}.json`), gameText);
    writeJsonFile(join(CHARACTER_LINES_DIRECTORY, `${language}.json`), characterLines);
    if (language === GameLanguage.English) voicedCount = Object.keys(characterLines).length;
  }

  writeFileSync(join(GENSHIN_TEXT_GENERATED_DIRECTORY, "GameTextLoaderMap.ts"), getGameTextLoaderMapSource());
  writeFileSync(
    join(dirname(CHARACTER_LINES_DIRECTORY), "CharacterLinesLoaderMap.ts"),
    getCharacterLinesLoaderMapSource(),
  );
  for (const modulePath of PersonaCopiedModules) {
    const copyPath = join(PERSONA_COPY_DIRECTORY, modulePath);
    mkdirSync(dirname(copyPath), { recursive: true });
    writeFileSync(
      copyPath,
      getPersonaModuleSource(readFileSync(join(GENSHIN_TEXT_SOURCE_DIRECTORY, modulePath), "utf8")),
    );
  }

  notes.push(
    `${ids.length} strings, and ${voicedCount} characters' lines, written in ${GameLanguages.length} languages`,
  );
  return notes;
};
