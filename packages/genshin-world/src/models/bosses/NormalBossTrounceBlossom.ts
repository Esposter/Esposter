import type { BaseTrounceBlossom } from "#src/models/bosses/BaseTrounceBlossom";
import type { BlossomKind } from "#src/models/originalResin/BlossomKind";

export interface NormalBossTrounceBlossom extends BaseTrounceBlossom {
  kind: BlossomKind.NormalBoss;
  uniqueDropId: number;
}
