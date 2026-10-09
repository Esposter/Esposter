import type { ArchiveKills } from "#src/models/archive/ArchiveKills";

// The kills with one more defeat of a Living Being counted under its entry. The kills given are left as they were
export const countArchiveDefeat = (kills: ArchiveKills, entryId: number): ArchiveKills =>
  new Map(kills).set(entryId, (kills.get(entryId) ?? 0) + 1);
