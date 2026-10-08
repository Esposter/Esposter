import type { ArchiveSection } from "#src/models/archive/ArchiveSection";

// The entries the player has met so far, each section holding the ids of the entries it has opened
export type ArchiveProgress = ReadonlyMap<ArchiveSection, ReadonlySet<number>>;
