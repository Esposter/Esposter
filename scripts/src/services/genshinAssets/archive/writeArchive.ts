import type { ArchiveEntry } from "genshin-world";

import { readBookCandidates } from "#src/services/genshinAssets/archive/readBookCandidates";
import { readEquipmentCandidates } from "#src/services/genshinAssets/archive/readEquipmentCandidates";
import { readGeographyCandidates } from "#src/services/genshinAssets/archive/readGeographyCandidates";
import { readLivingBeingCandidates } from "#src/services/genshinAssets/archive/readLivingBeingCandidates";
import { readMaterialCandidates } from "#src/services/genshinAssets/archive/readMaterialCandidates";
import { readTravelLogCandidates } from "#src/services/genshinAssets/archive/readTravelLogCandidates";
import { toArchiveEntries } from "#src/services/genshinAssets/archive/toArchiveEntries";
import { ARCHIVE_GENERATED_DIRECTORY, ArchiveSectionFileNameMap } from "#src/services/genshinAssets/archive/constants";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { ArchiveSection, archiveEntrySchema } from "genshin-world";
import { GameLanguage } from "genshin-text";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Every section of the Archive from the dump's codex tables, each entry named by the game's English text and checked against
// The world's own schema, written as one slice per section into the world's generated folder. The tutorials are written
// Empty, since the dump holds no name for their entries. Returns a note of each section's count
export const writeArchive = (): string[] => {
  const englishTextMap = readTextMap(GameLanguage.English);
  const { artifactSets, weapons } = readEquipmentCandidates();
  const sectionEntriesMap: Record<ArchiveSection, ArchiveEntry[]> = {
    [ArchiveSection.Equipment]: [
      ...toArchiveEntries(weapons, englishTextMap),
      ...toArchiveEntries(artifactSets, englishTextMap),
    ],
    [ArchiveSection.LivingBeings]: toArchiveEntries(readLivingBeingCandidates(), englishTextMap),
    [ArchiveSection.Tutorials]: [],
    [ArchiveSection.Geography]: toArchiveEntries(readGeographyCandidates(), englishTextMap),
    [ArchiveSection.TravelLog]: toArchiveEntries(readTravelLogCandidates(), englishTextMap),
    [ArchiveSection.Books]: toArchiveEntries(readBookCandidates(), englishTextMap),
    [ArchiveSection.Materials]: toArchiveEntries(readMaterialCandidates(), englishTextMap),
  };
  mkdirSync(ARCHIVE_GENERATED_DIRECTORY, { recursive: true });
  return Object.values(ArchiveSection).map((section) => {
    const entries = archiveEntrySchema.array().parse(sectionEntriesMap[section]);
    writeFileSync(join(ARCHIVE_GENERATED_DIRECTORY, ArchiveSectionFileNameMap[section]), JSON.stringify(entries));
    return `${section}: ${entries.length} entries`;
  });
};
