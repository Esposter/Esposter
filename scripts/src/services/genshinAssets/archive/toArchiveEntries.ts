import type { ArchiveCandidate } from "#src/models/genshinAssets/archive/ArchiveCandidate";

import { getNamedCandidates } from "#src/services/genshinAssets/archive/getNamedCandidates";

// The entries the candidates make, in the codex's order, each named by its English text's hash
export const toArchiveEntries = (
  candidates: readonly ArchiveCandidate[],
  englishTextMap: ReadonlyMap<string, string>,
): { id: number; nameTextId: string }[] =>
  getNamedCandidates(candidates, englishTextMap).map(({ id, nameTextMapHash }) => ({
    id,
    nameTextId: String(nameTextMapHash),
  }));
