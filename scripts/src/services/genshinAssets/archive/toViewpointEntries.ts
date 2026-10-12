import type { ViewpointCandidate } from "#src/models/genshinAssets/archive/ViewpointCandidate";
import type { ArchiveViewpoint } from "genshin-world";

import { getNamedCandidates } from "#src/services/genshinAssets/archive/getNamedCandidates";

// The viewpoints the candidates make, in the codex's order, each named by its English text's hash and keeping the group and
// Config id that place it
export const toViewpointEntries = (
  candidates: readonly ViewpointCandidate[],
  englishTextMap: ReadonlyMap<string, string>,
): ArchiveViewpoint[] =>
  getNamedCandidates(candidates, englishTextMap).map(({ configId, groupId, id, nameTextMapHash }) => ({
    configId,
    groupId,
    id,
    nameTextId: String(nameTextMapHash),
  }));
