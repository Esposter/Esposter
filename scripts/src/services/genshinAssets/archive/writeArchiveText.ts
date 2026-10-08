import type { ArchiveEntry } from "genshin-world";

import {
  ARCHIVE_GENERATED_DIRECTORY,
  ARCHIVE_TEXT_GENERATED_DIRECTORY,
  ArchiveSectionFileNameMap,
} from "#src/services/genshinAssets/archive/constants";
import { writeTextChunks } from "#src/services/genshinText/writeTextChunks";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { GameLanguages } from "genshin-text";
import { ArchiveSection } from "genshin-world";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// The name of every entry the Archive's written slices cite, in every language, into the world's own chunk per language by
// The same text ids, as `genshin:assets achievements` writes its titles. Run after `writeArchive`
export const writeArchiveText = (): string[] => {
  const textIds = [
    ...new Set(
      Object.values(ArchiveSection).flatMap((section) =>
        parseMachineJson<ArchiveEntry[]>(
          readFileSync(join(ARCHIVE_GENERATED_DIRECTORY, ArchiveSectionFileNameMap[section]), "utf8"),
        ).map(({ nameTextId }) => nameTextId),
      ),
    ),
  ].toSorted();
  const notes = writeTextChunks(ARCHIVE_TEXT_GENERATED_DIRECTORY, textIds);
  notes.push(`${textIds.length} archive names written in ${GameLanguages.length} languages`);
  return notes;
};
