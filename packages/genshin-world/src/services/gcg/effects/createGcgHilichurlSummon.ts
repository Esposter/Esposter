import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";
import type { Element } from "#src/models/Element";

const HILICHURL_SUMMON_DAMAGE = 1;
const HILICHURL_SUMMON_USAGES = 2;

// A Hilichurl summon: End Phase 1 DMG of its element, and it is spent after its two usages
export const createGcgHilichurlSummon = (element: Element): GcgCardModule => ({
  initialUsages: HILICHURL_SUMMON_USAGES,
  onEndPhase: (_context, zoneCard) => {
    zoneCard.usages -= 1;
    return { damageType: element, value: HILICHURL_SUMMON_DAMAGE };
  },
});
