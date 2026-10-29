import type { ArchiveCandidate } from "#src/models/genshinAssets/archive/ArchiveCandidate";
import type { ArchiveEntry } from "genshin-world";

import { getNamedCandidates } from "#src/services/genshinAssets/archive/getNamedCandidates";

// The entries the candidates make, in the codex's order, each named by its English text's hash and described by its
// Description's where the game's English text holds one
export const toArchiveEntries = (
  candidates: readonly ArchiveCandidate[],
  englishTextMap: ReadonlyMap<string, string>,
): ArchiveEntry[] =>
  getNamedCandidates(candidates, englishTextMap).map(({ descriptionTextMapHash, id, nameTextMapHash }) => {
    const descriptionTextId = String(descriptionTextMapHash);
    return {
      ...(descriptionTextMapHash !== undefined && englishTextMap.get(descriptionTextId) ? { descriptionTextId } : {}),
      id,
      nameTextId: String(nameTextMapHash),
    };
  });
