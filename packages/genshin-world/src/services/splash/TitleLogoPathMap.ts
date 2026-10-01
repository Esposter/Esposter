import type { TitleLogo } from "#src/models/splash/TitleLogo";

import titleLogos from "#src/data/splash/titleLogos.json";

// Each title logo as one filled path on the 4096 by 2752 box of the game's own 1024 by 688 sprites, every logo on the
// Same canvas, as `pnpm -C scripts genshin:assets fit login` traces them from the sprites the login interface picks by
// Language
export const TitleLogoPathMap: Record<TitleLogo, string> = titleLogos;
