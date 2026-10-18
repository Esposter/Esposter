import { EnemyKindId } from "#src/models/enemy/EnemyKindId";

// The Adventure Rank a mining outcrop is drawn at, and the time of the game's day each day's outcrops come, in the
// Game's time zone
export const MINING_OUTCROP_ADVENTURE_RANK = 30;
export const MINING_OUTCROP_REFRESH_TIME: Temporal.PlainTime = Temporal.PlainTime.from({ hour: 6 });
// The id prefix of the camp a touch spawns at an outcrop's place: the camp a place holds is named by it and the place's id
export const OUTCROP_CAMP_ID_PREFIX = "outcrop";
// The members a fight's camp places at an outcrop, the radius in metres they stand within of its place, and the level they
// Spawn at before the World Level raises them. Provisional until the wiki's enemies per place are paired with kinds
export const OUTCROP_CAMP_SIZE = 3;
export const OUTCROP_FIGHT_RADIUS = 6;
export const OUTCROP_CAMP_LEVEL = 1;
// The kinds a fight's members are drawn from: every kind the world places, read off the enum's numeric values
export const OUTCROP_CAMP_ENEMY_KIND_IDS = Object.values(EnemyKindId).filter(
  (value): value is EnemyKindId => typeof value === "number",
);
