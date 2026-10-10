import type { ArchiveBook, ArchiveEntry } from "genshin-world";

import { ArchiveSectionKeyMap } from "#src/services/genshinAssets/archive/constants";
import { getNamedCandidates } from "#src/services/genshinAssets/archive/getNamedCandidates";
import { readBookCandidates } from "#src/services/genshinAssets/archive/readBookCandidates";
import { readEquipmentCandidates } from "#src/services/genshinAssets/archive/readEquipmentCandidates";
import { readGeographyCandidates } from "#src/services/genshinAssets/archive/readGeographyCandidates";
import { readLivingBeingCandidates } from "#src/services/genshinAssets/archive/readLivingBeingCandidates";
import { readMaterialCandidates } from "#src/services/genshinAssets/archive/readMaterialCandidates";
import { readTravelLogCandidates } from "#src/services/genshinAssets/archive/readTravelLogCandidates";
import { readTutorialCandidates } from "#src/services/genshinAssets/archive/readTutorialCandidates";
import { toArchiveEntries } from "#src/services/genshinAssets/archive/toArchiveEntries";
import { readTextMap } from "#src/services/genshinText/readTextMap";
import { GameLanguage } from "genshin-text";
import {
  archiveBookSchema,
  archiveEntrySchema,
  ArchiveSection,
  GameDataset,
  travelLogEntrySchema,
} from "genshin-world";

// Each section's entries checked against the world's schema for it, which keeps the fields its own entries carry
const parseSectionEntries = (section: ArchiveSection, entries: readonly ArchiveEntry[]): ArchiveEntry[] => {
  if (section === ArchiveSection.Books) return archiveBookSchema.array().parse(entries);
  if (section === ArchiveSection.TravelLog) return travelLogEntrySchema.array().parse(entries);
  return archiveEntrySchema.array().parse(entries);
};

// Every section of the Archive from the dump's codex tables, each entry named by the game's English text and checked against
// The world's own schema for it, published as one record per section. Returns the id of each Volume's body, which the book
// Bodies read, a note of each section's count, and the sections' entries by their keys for the names to be read from
export const buildArchive = (): { bodyIds: number[]; notes: string[]; objects: Record<string, ArchiveEntry[]> } => {
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
  const notes: string[] = [];
  const objects: Record<string, ArchiveEntry[]> = {};
  for (const section of Object.values(ArchiveSection)) {
    const entries = parseSectionEntries(section, sectionEntriesMap[section]);
    notes.push(`${section}: ${entries.length} entries`);
    objects[`${GameDataset.Archive}/${ArchiveSectionKeyMap[section]}`] = entries;
  }
  return { bodyIds: books.map(({ bodyId }) => bodyId), notes, objects };
};
