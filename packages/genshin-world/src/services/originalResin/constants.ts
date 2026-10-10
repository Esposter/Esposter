// The most Original Resin regenerates to, a point each regeneration interval while it is below
export const ORIGINAL_RESIN_CAP = 200;
// The most Original Resin a refill fills to, past the regeneration cap
export const ORIGINAL_RESIN_REFILL_CAP = 2000;
// The minutes one point of Original Resin takes to regenerate
export const ORIGINAL_RESIN_REGEN_MINUTES = 8;
// The Original Resin a Primogem refill restores
export const PRIMOGEM_RESIN_RESTORE = 60;
// The Primogems each refill of a game day costs, in order, and a day holds as many refills as this has prices
export const PRIMOGEM_RESIN_REFILL_PRICES: readonly number[] = [50, 100, 100, 150, 200, 200];
// The game day starts at this hour in the game's server time, UTC+8, and runs to the same hour the next day
export const GAME_DAY_START_HOUR = 4;
export const GAME_TIME_ZONE = "Asia/Shanghai";
// The Companionship EXP item a claim's reward preview lists beside its items, which the claim leaves out of its draw
export const COMPANIONSHIP_EXP_ITEM_ID = 105;
// The Adventure EXP each point of Original Resin spent on a claim gives
export const ADVENTURE_EXP_PER_RESIN = 5;
// A weekly boss's claim costs the cheap price for each of the first claims a week, and the full price after them
export const WEEKLY_BOSS_CHEAP_CLAIMS = 3;
export const WEEKLY_BOSS_CHEAP_RESIN = 30;
export const WEEKLY_BOSS_RESIN = 60;
// The rewards one Condensed Resin claims at a ley line or a domain
export const CONDENSED_RESIN_CLAIM_COUNT = 3;
