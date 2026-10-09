import type { ArchiveBook, ArchiveEntry } from "genshin-world";

import { ARCHIVE_GENERATED_DIRECTORY, ArchiveSectionFileNameMap } from "#src/services/genshinAssets/archive/constants";
import { getNamedCandidates } from "#src/services/genshinAssets/archive/getNamedCandidates";
import { readBookCandidates } from "#src/services/genshinAssets/archive/readBookCandidates";
import { readEquipmentCandidates } from "#src/services/genshinAssets/archive/readEquipmentCandidates";
import { readGeographyCandidates } from "#src/services/genshinAssets/archive/readGeographyCandidates";
import { readLivingBeingCandidates } from "#src/services/genshinAssets/archive/readLivingBeingCandidates";
import { readMaterialCandidates } from "#src/services/genshinAssets/archive/readMaterialCandidates";
import { readTravelLogCandidates } from "#src/services/genshinAssets/archive/readTravelLogCandidates";
import { readTutorialCandidates } from "#src/services/genshinAssets/archive/readTutorialCandidates";
import { toArchiveEntries } from "#src/services/genshinAssets/archive/toArchiveEntries";
import { writeBookBodies } from "#src/services/genshinAssets/archive/writeBookBodies";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { GameLanguage } from "genshin-text";
import { archiveBookSchema, archiveEntrySchema, ArchiveSection, travelLogEntrySchema } from "genshin-world";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Each section's entries checked against the world's schema for it, which keeps the fields its own entries carry
const parseSectionEntries = (section: ArchiveSection, entries: readonly ArchiveEntry[]): unknown[] => {
  if (section === ArchiveSection.Books) return archiveBookSchema.array().parse(entries);
  if (section === ArchiveSection.TravelLog) return travelLogEntrySchema.array().parse(entries);
  return archiveEntrySchema.array().parse(entries);
};

// Every section of the Archive from the dump's codex tables, each entry named by the game's English text and checked against
// The world's own schema, written as one slice per section into the world's generated folder. Returns a note of each
// Section's count
export const writeArchive = (): string[] => {
  const englishTextMap = readTextMap(GameLanguage.English);
  const { artifactSets, weapons } = readEquipmentCandidates();
  const books: ArchiveBook[] = getNamedCandidates(readBookCandidates(), englishTextMap).map(
    ({ bodyId, id, materialId, nameTextMapHash }) => ({ bodyId, id, materialId, nameTextId: String(nameTextMapHash) }),
  );
  const sectionEntriesMap: Record<ArchiveSection, ArchiveEntry[]> = {
    [ArchiveSection.Books]: books,
    [ArchiveSection.Equipment]: [
      ...toArchiveEntries(weapons, englishTextMap),
      ...toArchiveEntries(artifactSets, englishTextMap),
    ],
    [ArchiveSection.Geography]: toArchiveEntries(readGeographyCandidates(), englishTextMap),
    [ArchiveSection.LivingBeings]: toArchiveEntries(readLivingBeingCandidates(), englishTextMap),
    [ArchiveSection.Materials]: toArchiveEntries(readMaterialCandidates(), englishTextMap),
    [ArchiveSection.TravelLog]: getNamedCandidates(readTravelLogCandidates(), englishTextMap).map(
      ({ id, nameTextMapHash, questId }) => ({ id, nameTextId: String(nameTextMapHash), questId }),
    ),
    [ArchiveSection.Tutorials]: toArchiveEntries(readTutorialCandidates(), englishTextMap),
  };
  mkdirSync(ARCHIVE_GENERATED_DIRECTORY, { recursive: true });
  const notes = Object.values(ArchiveSection).map((section) => {
    const entries = parseSectionEntries(section, sectionEntriesMap[section]);
    writeFileSync(join(ARCHIVE_GENERATED_DIRECTORY, ArchiveSectionFileNameMap[section]), JSON.stringify(entries));
    return `${section}: ${entries.length} entries`;
  });
  return [...notes, ...writeBookBodies(books.map(({ bodyId }) => bodyId))];
};
