import type { ArchiveCandidate } from "#src/models/genshinAssets/archive/ArchiveCandidate";

// The candidates whose name the game's English text holds, in the codex's order. A candidate whose name it does not hold
// Is left out, since an entry the world could show with no name is not kept
export const getNamedCandidates = <T extends ArchiveCandidate>(
  candidates: readonly T[],
  englishTextMap: ReadonlyMap<string, string>,
): T[] =>
  candidates
    .filter(({ nameTextMapHash }) => englishTextMap.get(String(nameTextMapHash)))
    .toSorted((firstCandidate, secondCandidate) => firstCandidate.sortOrder - secondCandidate.sortOrder);
