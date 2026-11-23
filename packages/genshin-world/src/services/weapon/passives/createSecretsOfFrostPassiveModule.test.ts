import type { Combatant } from "#src/models/kit/Combatant";
import type { DeployedCombatant } from "#src/models/kit/DeployedCombatant";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { RADIANCE_STELLAR_CONDUCT_STATUS_ID } from "#src/services/kit/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createDeployedCombatant } from "#src/services/party/createDeployedCombatant.test";
import { createSecretsOfFrostPassiveModule } from "#src/services/weapon/passives/createSecretsOfFrostPassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const createMember = (characterId: number, element: Element): DeployedCombatant =>
  createDeployedCombatant(
    {
      ascension: 0,
      attributes: computeCharacterAttributes([]),
      characterId,
      constellationCount: 0,
      element,
      elementalResonances: [],
      kit: TRAVELER_KIT,
      level: 1,
    },
    { isOnField: false },
  );

describe(createSecretsOfFrostPassiveModule, () => {
  const wielder: Combatant = createMember(TRAVELER_CHARACTER_ID, Element.Cryo);
  // Winter's Heavy Heart at its first rank: 24 Elemental Mastery for each Cryo member and 4.8% ATK for each Electro
  // One, and in Radiance 20 Elemental Mastery and 6% Stellar Glimmer DMG for each of either, with no ATK
  const passiveModule = createSecretsOfFrostPassiveModule([24, 0.048, 20, 0.06, 4]);

  test("each Cryo member in the party adds the rank's Elemental Mastery, and each Electro member its ATK", () => {
    expect.hasAssertions();

    const deployedCombatants = [
      createDeployedCombatant(wielder, { isOnField: true }),
      createMember(1, Element.Cryo),
      createMember(2, Element.Electro),
      createMember(3, Element.Hydro),
    ];

    expect(passiveModule.getPassiveBonuses?.(wielder, 1, deployedCombatants, [])).toStrictEqual([
      { amount: 24 * 2, attribute: Attribute.ElementalMastery },
      { amount: 0.048, attribute: Attribute.AttackPercent },
    ]);
  });

  test("in Radiance each Cryo or Electro member adds the Radiance Elemental Mastery and Stellar Glimmer DMG, and no ATK", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    addKitStatus(context.kitEffectState, TRAVELER_CHARACTER_ID, {
      id: RADIANCE_STELLAR_CONDUCT_STATUS_ID,
      secondsRemaining: 5,
    });
    const deployedCombatants = [
      createDeployedCombatant(wielder, { isOnField: true }),
      createMember(1, Element.Electro),
      createMember(2, Element.Hydro),
      createMember(3, Element.Pyro),
    ];

    expect(
      passiveModule.getPassiveBonuses?.(wielder, 1, deployedCombatants, context.kitEffectState.effects),
    ).toStrictEqual([
      { amount: 20 * 2, attribute: Attribute.ElementalMastery },
      { amount: 0.06 * 2, attribute: Attribute.StellarGlimmerReactionDamageBonus },
    ]);
  });
});
