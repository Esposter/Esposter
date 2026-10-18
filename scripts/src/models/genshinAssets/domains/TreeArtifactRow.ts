import type { TreeArtifact } from "genshin-world";

// One Adventure Rank's row of the Domain of Blessing's table: the artifacts of each rarity a claim draws
export interface TreeArtifactRow {
  artifacts: TreeArtifact[];
  rank: number;
}
