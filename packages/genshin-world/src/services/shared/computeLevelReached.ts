// The level an EXP total has reached over a table of levels, each level's EXP being the total to reach it, so the first
// Level holds from none at all and nothing reads past the top level. A Friendship Level and a Player Level read alike
export const computeLevelReached = (exp: number, levels: readonly { exp: number }[]): number =>
  levels.filter((level) => exp >= level.exp).length;
