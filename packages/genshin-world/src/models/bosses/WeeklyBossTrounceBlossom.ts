import type { BaseTrounceBlossom } from "#src/models/bosses/BaseTrounceBlossom";
import type { BlossomKind } from "#src/models/originalResin/BlossomKind";

export interface WeeklyBossTrounceBlossom extends BaseTrounceBlossom {
  kind: BlossomKind.WeeklyBoss;
}
