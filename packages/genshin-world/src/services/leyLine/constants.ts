import { EnemyKindId } from "#src/models/enemy/EnemyKindId";

// The Adventure Rank a mining outcrop is drawn at, and the time of the game's day each day's outcrops come, in the
// Game's time zone
// The region the ley line outcrops are drawn in, whose places the outcrops stand at
export const OUTCROP_REGION_ID = "mondstadt";
export const MINING_OUTCROP_ADVENTURE_RANK = 30;
export const MINING_OUTCROP_REFRESH_TIME: Temporal.PlainTime = Temporal.PlainTime.from({ hour: 6 });
// The id prefix of the camp a touch spawns at an outcrop's place: the camp a place holds is named by it and the place's id
export const OUTCROP_CAMP_ID_PREFIX = "outcrop";
// The members a fight's camp places at an outcrop, the radius in metres they stand within of its place, and the level they
// Spawn at before the World Level raises them. Provisional until the wiki's enemies per place are paired with kinds
export const OUTCROP_CAMP_SIZE = 3;
export const OUTCROP_FIGHT_RADIUS = 6;
// The radius in metres the character must stand within of an outcrop's place to touch it, which starts its fight. Provisional
// Until the game's touch range is measured
export const OUTCROP_TOUCH_RADIUS = 4;
export const OUTCROP_CAMP_LEVEL = 1;
// The kinds a fight's members are drawn from: every kind the world places, read off the enum's numeric values
export const OUTCROP_CAMP_ENEMY_KIND_IDS = Object.values(EnemyKindId).filter(
  (value): value is EnemyKindId => typeof value === "number",
);
