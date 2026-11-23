// The dev environment's public genshin assets bucket, served under its bucket name, which the machine-wide content cache
// Fills a miss from.
// The scripts package builds the same address from its environment map, and neither can import the other's tooling.
// The address is therefore written here
export const GAME_DATA_MIRROR_SOURCE_URL = "https://assets.dev.esposter.com/public-genshin-assets";
