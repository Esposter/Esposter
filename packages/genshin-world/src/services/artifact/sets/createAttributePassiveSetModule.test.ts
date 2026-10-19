import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { createAttributePassiveSetModule } from "#src/services/artifact/sets/createAttributePassiveSetModule";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitCombatant } from "#src/services/kit/createKitCombatant.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(createAttributePassiveSetModule, () => {
  const wearer = createKitCombatant(TRAVELER_CHARACTER_ID, TRAVELER_KIT);

  test("prices its wearer at the amount in each of its attributes, whatever the wearer is doing", () => {
    expect.hasAssertions();

    const module = createAttributePassiveSetModule(
      [Attribute.NormalAttackDamageBonus, Attribute.ChargedAttackDamageBonus],
      0.15,
    );
    expect(module.getPassiveBonuses?.(wearer, 1, [], [])).toStrictEqual([
      { amount: 0.15, attribute: Attribute.NormalAttackDamageBonus },
      { amount: 0.15, attribute: Attribute.ChargedAttackDamageBonus },
    ]);
  });
});
