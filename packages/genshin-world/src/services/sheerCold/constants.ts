// The areas the subzero climate covers, by catalogue id. The game's own text names the climate, and the dump's climate
// Buffs carry its rules, but no table names the areas it covers, so Dragonspine is the one the catalogue holds
export const SHEER_COLD_AREA_IDS: readonly string[] = ["dragonspine"];
// The gauge's full scale, in the percent the wiki measures it by
export const SHEER_COLD_MAXIMUM = 100;
// The percent of the gauge filled each second in the subzero climate, the wiki's base rate before its modifiers
export const SHEER_COLD_GAIN_PER_SECOND = 1;
// The modifier swimming adds to the accumulation rate, the wiki's +180%. Modifiers stack additively, so the rate is the
// Base rate times one plus the modifiers
export const SHEER_COLD_SWIM_MODIFIER = 1.8;
// The modifier a snowstorm adds to the accumulation rate, the wiki's +200%, stacking additively with the swim modifier
export const SHEER_COLD_SNOWSTORM_MODIFIER = 2;
// The percent heat drains the gauge each second in the subzero climate, the wiki's 5% per 0.2 seconds
export const SHEER_COLD_HEAT_DRAIN_PER_SECOND = 25;
// The percent the gauge drains each second outside the climate with no heat, the wiki's rate for leaving an area
export const SHEER_COLD_LEAVE_DRAIN_PER_SECOND = 5;
// Provisional: the metres from a lit heat source within which it heats the character. The wiki names no reach for one
export const SHEER_COLD_HEAT_RADIUS = 5;
// The share of the character's max HP lost each interval the gauge stays full, the wiki's 1% of max HP
export const SHEER_COLD_DAMAGE_SHARE = 0.01;
// The flat HP lost each interval the gauge stays full on top of the share, the wiki's 150 HP
export const SHEER_COLD_DAMAGE_FLAT = 150;
// The seconds between two losses of HP while the gauge stays full. The wiki's loss is each second; its table's 30 seconds
// To 6,428 HP is one second's share and flat amount over thirty seconds
export const SHEER_COLD_DAMAGE_INTERVAL_SECONDS = 1;
