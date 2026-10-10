// The base a test or the parity page reads the hosted game data from: a path its own fetch route or middleware answers
// From the local mirror, so no test reads a copy of the game data and none reaches an account on a hit. It imports
// Nothing, because the fixtures that pass it run in the browser
export const GAME_DATA_LOCAL_BASE_URL = "/game-data";
