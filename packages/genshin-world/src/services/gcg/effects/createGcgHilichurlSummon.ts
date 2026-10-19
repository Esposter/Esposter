import type { Element } from "#src/models/Element";
import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { createGcgEndPhaseDamageSummon } from "#src/services/gcg/effects/createGcgEndPhaseDamageSummon";

const HILICHURL_SUMMON_DAMAGE = 1;
const HILICHURL_SUMMON_USAGES = 2;

// A Hilichurl summon: End Phase 1 DMG of its element, and it is spent after its two usages
export const createGcgHilichurlSummon = (element: Element): GcgCardModule =>
  createGcgEndPhaseDamageSummon({
    damage: HILICHURL_SUMMON_DAMAGE,
    damageType: element,
    usages: HILICHURL_SUMMON_USAGES,
  });
