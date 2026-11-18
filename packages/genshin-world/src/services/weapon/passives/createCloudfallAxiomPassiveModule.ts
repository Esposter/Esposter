import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitTeam } from "#src/services/kit/effects/buffKitTeam";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";
import { takeOne } from "@esposter/shared";

const CLOUDFALL_AXIOM_ENERGY_COOLDOWN_ID = "cloudfallAxiomEnergyCooldown";
const CLOUDFALL_AXIOM_SOURCE = "cloudfallAxiom";

// Cloudfall Axiom at its rank: a Plunging Attack its wielder hits with raises every deployed member's Plunging Attack DMG by
// The rank's amount for the rank's seconds. A nearby member's Plunging Attack hit restores the rank's Energy to the wielder,
// Whether or not it is on the field, at most once every the rank's energy cooldown in seconds
export const createCloudfallAxiomPassiveModule = (params: number[]): PassiveModule => {
  const energy = takeOne(params, 0);
  const energyCooldownSeconds = takeOne(params, 1);
  const damageBonus = takeOne(params, 2);
  const seconds = takeOne(params, 3);
  return {
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.DamageTaken || event.attackTag !== AttackTag.PlungingAttack) return;
      if (event.striker.characterId === combatant.characterId)
        buffKitTeam(context.kitEffectState, context.party, {
          amount: damageBonus,
          attribute: Attribute.PlungingAttackDamageBonus,
          secondsRemaining: seconds,
          source: CLOUDFALL_AXIOM_SOURCE,
        });
      else if (
        startKitCooldown(
          context.kitEffectState,
          combatant.characterId,
          CLOUDFALL_AXIOM_ENERGY_COOLDOWN_ID,
          energyCooldownSeconds,
        )
      )
        gainPartyMemberEnergy(context.party, combatant, energy);
    },
  };
};
