// Where the Genshin world fetches each region's data from, which the server serves from the world package. It must
// Not share a page's path: a public asset directory there answers a reload of the page with a redirect to its
// Trailing-slash form, which no page matches
export const GENSHIN_REGION_DATA_BASE_URL = "data/genshin/regions";
