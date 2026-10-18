import type { ShrineOfDepths } from "#src/models/puzzle/ShrineOfDepths";

// A Shrine of Depths opened with a key of its own region. A key of any other region is refused and leaves it shut
export const openShrineOfDepths = (shrine: ShrineOfDepths, keyRegion: string): void => {
  if (keyRegion === shrine.region) shrine.isOpen = true;
};
