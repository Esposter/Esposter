import type { ArtifactSetBonus } from "#src/models/artifact/ArtifactSetBonus";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { takeOne } from "@esposter/shared";

// Emblem of Severed Fate. Its four-piece bonus raises the Elemental Burst DMG its wearer's burst strikes by the table's first
// Param of its Energy Recharge, up to the second param, as the Energy Recharge the strike's wearer is priced with reads
export const createEmblemOfSeveredFateSetModule = (bonus: ArtifactSetBonus): PassiveModule => {
  const energyRechargeShare = takeOne(bonus.params, 0);
  const maximumDamageBonus = takeOne(bonus.params, 1);
  return {
    getStrikeDamageBonus: (strike) =>
      strike.attackTag === AttackTag.ElementalBurst
        ? Math.min(
            energyRechargeShare * strike.combatant.attributes.attributeTotalMap[Attribute.EnergyRecharge],
            maximumDamageBonus,
          )
        : 0,
  };
};
