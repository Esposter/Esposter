// The dev environment's public genshin assets bucket, which the machine-wide content cache fills a miss from.
// The scripts package builds the same address from its environment map, and neither can import the other's tooling.
// The address is therefore written here
export const GAME_DATA_MIRROR_SOURCE_URL = "https://assets.dev.esposter.com/dev-r2-esposter-public-genshin-assets";
// Downloads in flight at once while the mirror is filled whole, which bounds the fill's memory by one wave of objects
export const MAX_CONCURRENT_MIRROR_DOWNLOADS = 16;
