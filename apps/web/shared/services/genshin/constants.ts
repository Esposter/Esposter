// Where the Genshin world fetches each region's data from, which the server serves from the world package
export const GENSHIN_REGION_DATA_BASE_URL = "data/genshin/regions";
// Where the login's music fetches the recordings its voices play over their synthesized notes, which the server serves
// From the world package
export const GENSHIN_LOGIN_MUSIC_RECORDING_BASE_URL = "data/genshin/login/recordings";
// Where the signed-in player's own kept packs are served from, one file at a time by its hash, to that player alone
export const GENSHIN_ACCOUNT_CHARACTER_PACK_FILE_BASE_URL = "/api/genshin/character-packs/files";
// Where the Genshin world reads the game's own exported scenes from, which only the development server answers, from
// The developer's own extraction: nothing taken from the game's files ships, so no production build serves them and the
// World there draws our own stand-ins alone
export const GENSHIN_SCENE_EXPORT_BASE_URL = "/data/genshin/exports";
// How long the startup loading screen may wait on a step before it logs which step it is still waiting on, in seconds
export const LOADING_STALL_WARNING_SECONDS = 20;
