import type { ParityRegion } from "#src/models/genshinParity/ParityRegion";

export interface ParityReference {
  // The part a comparison scores, in the reference's own pixels, so the world behind a menu never counts against it;
  // The whole frame when absent
  region?: ParityRegion;
  // The parity page's screen that recreates it, at `/genshin-parity/<screen>`
  screen: string;
  // The wiki file it is fetched from
  wikiTitle: string;
}
