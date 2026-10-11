// Where the Genshin world fetches each region's data from, which the server serves from the world package
export const GENSHIN_REGION_DATA_BASE_URL = "data/genshin/regions";
// Where the login's music fetches the recordings its voices play over their synthesized notes, which the server serves
// From the world package
export const GENSHIN_LOGIN_MUSIC_RECORDING_BASE_URL = "data/genshin/login/recordings";
// Where the Genshin world reads the characters' packs from, which only the development server answers, from the
// Developer's own extracted packs: the official packs' terms forbid redistributing them, so no production build serves
// Them and the world there draws every character as its capsule
export const GENSHIN_CHARACTER_PACK_BASE_URL = "/data/genshin/characters";
