import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";

import reliquarySets from "#src/data/items/reliquarySets.json";
import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { openArchiveEntry } from "#src/services/archive/openArchiveEntry";

const setPieceCountMap = new Map(reliquarySets.map(({ id, pieceItemIds }) => [id, pieceItemIds.length]));

// The progress with the Equipment entry of every set opened once the artifacts held cover as many distinct slots as the
// Set has pieces. A set with no Equipment entry, which is not among the ids given, opens nothing, and the progress given
// Is left as it was when no set opens
export const openArchiveArtifactSets = (
  progress: ArchiveProgress,
  artifacts: readonly Pick<Artifact, "setId" | "slot">[],
  equipmentEntryIds: ReadonlySet<number>,
): ArchiveProgress => {
  const slotsSetMap = new Map<number, Set<ArtifactSlot>>();
  for (const { setId, slot } of artifacts) {
    const slots = slotsSetMap.get(setId) ?? new Set<ArtifactSlot>();
    slots.add(slot);
    slotsSetMap.set(setId, slots);
  }

  let nextProgress = progress;
  for (const [setId, slots] of slotsSetMap) {
    const pieceCount = setPieceCountMap.get(setId);
    if (pieceCount === undefined || !equipmentEntryIds.has(setId) || slots.size < pieceCount) continue;
    nextProgress = openArchiveEntry(nextProgress, ArchiveSection.Equipment, setId);
  }

  return nextProgress;
};
