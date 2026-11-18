import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { takeOne } from "@esposter/shared";

const LIYUE_REGION_ID = "liyue";

// Lithic Axiom: Unity at its rank: the wielder's ATK and CRIT Rate each rise by the rank's amount for every member of the
// Deployed team from Liyue, the wielder among them. A team is at most four members, which is the passive's own cap of four
export const createLithicAxiomUnityPassiveModule = (params: number[]): PassiveModule => {
  const attackPercentPerMember = takeOne(params, 0);
  const criticalRatePerMember = takeOne(params, 1);
  return {
    getPassiveBonuses: (_combatant, _healthShare, deployedCombatants) => {
      const count = deployedCombatants.filter(({ regionId }) => regionId === LIYUE_REGION_ID).length;
      return [
        { amount: attackPercentPerMember * count, attribute: Attribute.AttackPercent },
        { amount: criticalRatePerMember * count, attribute: Attribute.CriticalRate },
      ];
    },
  };
};
