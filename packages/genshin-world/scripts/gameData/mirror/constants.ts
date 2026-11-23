// The dev environment's hosted origin, which the machine-wide content cache fills a miss from.
// The scripts package reads the same address from its environment map, and neither can import the other's tooling.
// The address is therefore written here
export const GAME_DATA_MIRROR_SOURCE_URL = "https://hosted.dev.esposter.com";
