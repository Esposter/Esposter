import type { GcgCardModule } from "#src/models/gcg/GcgCardModule";

import { GcgSkillKind } from "#src/models/gcg/GcgSkillKind";

// The status a character switched to holds for the round.
// The dump names no card for it, so it is held under the artifact's own second skill id, as Senho's passive is.
const VERMILLION_HEREAFTER_BONUS = 1;

// The Normal Attack DMG a character switched to the active character deals for the Round
export const vermillionHereafterBonus: GcgCardModule = {
  initialRounds: 1,
  modifyDamageDealt: (context, damage) =>
    context.skill?.kind === GcgSkillKind.NormalAttack
      ? { ...damage, value: damage.value + VERMILLION_HEREAFTER_BONUS }
      : damage,
};
