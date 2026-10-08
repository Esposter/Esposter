import type { ArchiveCandidate } from "#src/models/genshinAssets/archive/ArchiveCandidate";
import type { ArchiveEntry } from "genshin-world";

// The entries the candidates make, in the codex's order. A candidate whose name the game's English text does not hold is
// Left out, since an entry the world could show with no name is not kept
export const toArchiveEntries = (
  candidates: readonly ArchiveCandidate[],
  englishTextMap: ReadonlyMap<string, string>,
): ArchiveEntry[] =>
  candidates
    .filter(({ nameTextMapHash }) => englishTextMap.get(String(nameTextMapHash)))
    .toSorted((firstCandidate, secondCandidate) => firstCandidate.sortOrder - secondCandidate.sortOrder)
    .map(({ id, nameTextMapHash }) => ({ id, nameTextId: String(nameTextMapHash) }));
