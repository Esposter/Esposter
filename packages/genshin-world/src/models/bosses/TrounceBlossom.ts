import type { BlossomKind } from "#src/models/originalResin/BlossomKind";
import type { GroundPoint } from "genshin-engine";

// A boss's Trounce Blossom, left where the boss fell: its place, and every time it was claimed, oldest first, none until
// It is. A normal boss's is claimed once until the boss comes back, and pays the boss's own drop; a weekly boss's is claimed
// Once a week, its list growing across the weeks and the week's count read from it
interface BaseTrounceBlossom {
  claimedAts: Temporal.Instant[];
  place: GroundPoint;
}

export interface NormalBossTrounceBlossom extends BaseTrounceBlossom {
  kind: BlossomKind.NormalBoss;
  uniqueDropId: number;
}

export interface WeeklyBossTrounceBlossom extends BaseTrounceBlossom {
  kind: BlossomKind.WeeklyBoss;
}

export type TrounceBlossom = NormalBossTrounceBlossom | WeeklyBossTrounceBlossom;
