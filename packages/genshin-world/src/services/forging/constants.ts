// The most forge points a player may forge in one game day, counted across the enhancement ores together. A recipe past it
// Is refused until the daily reset, which the game's own words say
export const FORGE_DAILY_POINT_CAP = 400_000;
// The Adventure Rank each queue at the blacksmith opens at, in order, as the game's forge update table holds them: one queue
// At first, a second at rank five, a third at ten and a fourth at fifteen
export const FORGE_QUEUE_PLAYER_LEVELS: readonly number[] = [1, 5, 10, 15];
