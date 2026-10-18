// The areas the subzero climate covers, by catalogue id. The game's own text names the climate, and the dump's climate
// Buffs carry its rules, but no table names the areas it covers, so Dragonspine is the one the catalogue holds
export const SHEER_COLD_AREA_IDS: readonly string[] = ["dragonspine"];
// Provisional: the full scale of the gauge, in units no table gives. The dump's buffs say the gauge fills and drains but
// Not by how much, so the gauge is measured in its own units until a recording of the bar is read
export const SHEER_COLD_MAXIMUM = 100;
// Provisional: the units the gauge fills by each second in the subzero climate, not yet read off a recording
export const SHEER_COLD_GAIN_PER_SECOND = 1;
// Provisional: how much faster the gauge fills while swimming. The game's text says swimming accelerates it, not by how much
export const SHEER_COLD_SWIM_GAIN_MULTIPLIER = 2;
// Provisional: the units heat drains the gauge by each second, the game's text saying only that heat diminishes it
export const SHEER_COLD_HEAT_DRAIN_PER_SECOND = 5;
// Provisional: the metres from a lit heat source within which it heats the character
export const SHEER_COLD_HEAT_RADIUS = 5;
// The share of the character's maximum HP lost each interval the gauge stays full, the dump's climate buff's own figure
export const SHEER_COLD_DAMAGE_SHARE = 0.05;
// The seconds between two losses of HP while the gauge stays full, the dump's climate buff's own figure
export const SHEER_COLD_DAMAGE_INTERVAL_SECONDS = 2;
