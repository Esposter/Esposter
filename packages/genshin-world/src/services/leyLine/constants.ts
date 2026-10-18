// The Adventure Rank a mining outcrop is drawn at, and the time of the game's day each day's outcrops come, in the
// Game's time zone
export const MINING_OUTCROP_ADVENTURE_RANK = 30;
export const MINING_OUTCROP_REFRESH_TIME: Temporal.PlainTime = Temporal.PlainTime.from({ hour: 6 });
// The id prefix of the camp a touch spawns at an outcrop's place: the camp a place holds is named by it and the place's id
export const OUTCROP_CAMP_ID_PREFIX = "outcrop";
