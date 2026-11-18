import { Attribute } from "#src/models/character/Attribute";
import { createParty } from "#src/services/party/createParty";
import { getDeployedCombatants } from "#src/services/party/getDeployedCombatants";
import { createLithicAxiomUnityPassiveModule } from "#src/services/weapon/passives/createLithicAxiomUnityPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createWielderCombatant.test";
import { describe, expect, test } from "vitest";

const LIYUE_REGION_ID = "liyue";
const OTHER_CHARACTER_ID = 1;

describe(createLithicAxiomUnityPassiveModule, () => {
  // Lithic Axiom: Unity at its first rank: 7% ATK and 3% CRIT Rate for each party member from Liyue
  const passiveModule = createLithicAxiomUnityPassiveModule([0.07, 0.03]);
  // The deployed team of a wielder and one other member, each from the given region
  const getTeamBonuses = (wielderRegionId: string, otherRegionId: string) => {
    const wielder = { ...createWielderCombatant(), regionId: wielderRegionId };
    const other = { ...wielder, characterId: OTHER_CHARACTER_ID, regionId: otherRegionId };
    const characterIdCombatantMap = new Map([
      [other.characterId, other],
      [wielder.characterId, wielder],
    ]);
    const party = createParty([wielder.characterId, other.characterId]);
    return passiveModule.getPassiveBonuses?.(wielder, 1, getDeployedCombatants(party, characterIdCombatantMap), []);
  };

  test("each party member from Liyue, the wielder among them, raises its ATK and CRIT Rate by the rank's amount", () => {
    expect.hasAssertions();

    expect(getTeamBonuses(LIYUE_REGION_ID, LIYUE_REGION_ID)).toStrictEqual([
      { amount: 0.14, attribute: Attribute.AttackPercent },
      { amount: 0.06, attribute: Attribute.CriticalRate },
    ]);
  });

  test("a party with no member from Liyue raises nothing", () => {
    expect.hasAssertions();

    expect(getTeamBonuses("", "")).toStrictEqual([
      { amount: 0, attribute: Attribute.AttackPercent },
      { amount: 0, attribute: Attribute.CriticalRate },
    ]);
  });
});
