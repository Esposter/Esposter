import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { AttackTag } from "#src/models/combat/AttackTag";
import { scheduleKitTask } from "#src/services/kit/effects/scheduleKitTask";
import { startKitElementalSkillHitCooldown } from "#src/services/kit/effects/startKitElementalSkillHitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";

const SAMURAI_CONDUCT_COOLDOWN_ID = "samuraiConductCooldown";
// The seconds between the energy regenerated on each tick, which the passive's text fixes
const SAMURAI_CONDUCT_TICK_SECONDS = 2;

// Samurai Conduct at its rank: the Elemental Skill DMG its wielder deals is raised by the rank's percentage. After its
// Elemental Skill hits an opponent, the wielder loses the rank's first energy and regenerates the rank's second on each
// Tick for the rank's seconds, once every cooldown the rank gives, whether or not the wielder is on the field
export const createSamuraiConductPassiveModule = (params: number[]): PassiveModule => {
  const damageBonus = takeOne(params, 0);
  const energySpent = takeOne(params, 1);
  const energyRegenerated = takeOne(params, 2);
  const seconds = takeOne(params, 3);
  const cooldownSeconds = takeOne(params, 4);
  return {
    getStrikeDamageBonus: (strike) => (strike.attackTag === AttackTag.ElementalSkill ? damageBonus : 0),
    onKitEvent: (event, context, combatant) => {
      if (
        !startKitElementalSkillHitCooldown(
          event,
          context.kitEffectState,
          combatant,
          SAMURAI_CONDUCT_COOLDOWN_ID,
          cooldownSeconds,
        )
      )
        return;
      const partyMember = getPartyMember(context.party, combatant.characterId);
      partyMember.energy = Math.max(0, partyMember.energy - energySpent);
      for (let tick = 1; tick * SAMURAI_CONDUCT_TICK_SECONDS <= seconds; tick++)
        scheduleKitTask(
          context.kitEffectState,
          combatant.characterId,
          tick * SAMURAI_CONDUCT_TICK_SECONDS,
          (tickContext) => {
            const wielder = tickContext.characterIdCombatantMap.get(combatant.characterId);
            if (wielder) gainPartyMemberEnergy(tickContext.party, wielder, energyRegenerated);
          },
        );
    },
  };
};
