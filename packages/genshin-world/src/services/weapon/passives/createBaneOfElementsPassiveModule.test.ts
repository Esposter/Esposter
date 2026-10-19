import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { AuraType } from "#src/models/combat/AuraType";
import { Element } from "#src/models/Element";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { createBaneOfElementsPassiveModule } from "#src/services/weapon/passives/createBaneOfElementsPassiveModule";
import { createWielderCombatant } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

// An enemy under the aura given, or under none
const createEnemyUnder = (auraType?: AuraType) => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  if (auraType !== undefined) enemy.elementalState.auras.set(auraType, { decayRate: 0, gauge: 1, isImmutable: false });
  return enemy;
};

describe(createBaneOfElementsPassiveModule, () => {
  const wielder: Combatant = createWielderCombatant();
  const strike: KitStrike = {
    body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
    combatant: wielder,
    hit: takeOne(takeOne(KIT.normalAttacks).hits),
  };

  const party = createParty([TRAVELER_CHARACTER_ID]);

  test("a bane passive raises a strike on an enemy under either of its elements", () => {
    expect.hasAssertions();

    const module = createBaneOfElementsPassiveModule([Element.Hydro, Element.Cryo], [0.2]);

    expect(module.getStrikeDamageBonus?.(strike, createEnemyUnder(AuraType.Hydro), party, [])).toBe(0.2);
    expect(module.getStrikeDamageBonus?.(strike, createEnemyUnder(AuraType.Cryo), party, [])).toBe(0.2);
  });

  test("a bane passive gives nothing to an enemy under neither of its elements", () => {
    expect.hasAssertions();

    const module = createBaneOfElementsPassiveModule([Element.Hydro, Element.Cryo], [0.2]);

    expect(module.getStrikeDamageBonus?.(strike, createEnemyUnder(AuraType.Pyro), party, [])).toBe(0);
    expect(module.getStrikeDamageBonus?.(strike, createEnemyUnder(), party, [])).toBe(0);
  });

  test("a bane passive takes the bonus of the rank it is at", () => {
    expect.hasAssertions();

    const module = createBaneOfElementsPassiveModule([Element.Hydro, Element.Pyro], [0.4]);

    expect(module.getStrikeDamageBonus?.(strike, createEnemyUnder(AuraType.Pyro), party, [])).toBe(0.4);
  });
});
