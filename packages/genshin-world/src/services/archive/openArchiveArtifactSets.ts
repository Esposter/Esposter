import type { ArchiveProgress } from "#src/models/archive/ArchiveProgress";
import type { Artifact } from "#src/models/artifact/Artifact";
import type { ArtifactSlot } from "#src/models/artifact/ArtifactSlot";
import type { ReliquarySetData } from "#src/models/reliquary/ReliquarySetData";

import { ArchiveSection } from "#src/models/archive/ArchiveSection";
import { openArchiveEntry } from "#src/services/archive/openArchiveEntry";

// The progress with the Equipment entry of every set opened once the artifacts held cover as many distinct slots as the
// Set has pieces. A set with no Equipment entry, which is not among the ids given, opens nothing, and the progress
// It is left as it was when no set opens
export const openArchiveArtifactSets = (
  progress: ArchiveProgress,
  artifacts: readonly Pick<Artifact, "setId" | "slot">[],
  equipmentEntryIds: ReadonlySet<number>,
  reliquarySets: readonly ReliquarySetData[],
): ArchiveProgress => {
  const setPieceCountMap = new Map(reliquarySets.map(({ id, pieceItemIds }) => [id, pieceItemIds.length]));
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
