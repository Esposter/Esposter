import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { createOfferingUntoWindAndSunPassiveModule } from "#src/services/weapon/passives/createOfferingUntoWindAndSunPassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const createCombatant = (characterId: number, kit: Kit): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId,
  constellationCount: 0,
  elementalResonances: [],
  kit,
  level: 1,
});

describe(createOfferingUntoWindAndSunPassiveModule, () => {
  // Offering Unto Wind and Sun at its first rank: a shield its wielder casts on the field gives Mirror of Night for 15
  // Seconds, the member on the field dealing 28% more DMG, once every 14 seconds
  const passiveModule = createOfferingUntoWindAndSunPassiveModule([0.28, 15, 14]);
  const OTHER_CHARACTER_ID = 1;
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createCombatant(TRAVELER_CHARACTER_ID, getPassiveKit(TRAVELER_KIT, [passiveModule]));
  const other = createCombatant(OTHER_CHARACTER_ID, TRAVELER_KIT);
  const createContext = (): KitContext =>
    createKitTestContext(wielder, {
      characterIdCombatantMap: new Map([
        [TRAVELER_CHARACTER_ID, wielder],
        [OTHER_CHARACTER_ID, other],
      ]),
      party: createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]),
    });
  // The DMG Bonus a strike by the given member takes from the wielder's weapon: its own hook for the wielder's strike,
  // And the party hook it lends the others
  const priceStrike = (context: KitContext, striker: Combatant): number => {
    const strike: KitStrike = { body: context.body, combatant: striker, hit: TRAVELER_KIT.plungeCollision };
    const { characterIdCombatantMap, kitEffectState, party } = context;
    if (striker === wielder)
      return wielder.kit.getStrikeDamageBonus?.(strike, enemy, party, kitEffectState.effects) ?? 0;
    return (
      wielder.kit.getPartyStrikeBonus?.(wielder, strike, enemy, party, kitEffectState.effects, characterIdCombatantMap)
        ?.damageBonus ?? 0
    );
  };

  test.each([
    ["the wielder on the field", 0, wielder, 0.28],
    ["another member once it is on the field", 1, other, 0.28],
    ["the wielder once it is off the field", 1, wielder, 0],
  ])("a shield the wielder casts on the field raises the DMG of %s", (_title, activeIndex, striker, damageBonus) => {
    expect.hasAssertions();

    const context = createContext();
    castKitShield(context, TRAVELER_CHARACTER_ID, { health: 1, secondsRemaining: 10 });
    context.party.activeIndex = activeIndex;

    expect(priceStrike(context, striker)).toBe(damageBonus);
  });

  test.each([
    ["another member casts", OTHER_CHARACTER_ID, 0],
    ["the wielder casts off the field", TRAVELER_CHARACTER_ID, 1],
  ])("a shield %s gives nothing", (_title, casterCharacterId, activeIndex) => {
    expect.hasAssertions();

    const context = createContext();
    context.party.activeIndex = activeIndex;
    castKitShield(context, casterCharacterId, { health: 1, secondsRemaining: 10 });
    context.party.activeIndex = 0;

    expect(priceStrike(context, wielder)).toBe(0);
  });

  test("its Mirror of Night ends after 15 seconds, and a shield within 14 seconds of its start does not renew it", () => {
    expect.hasAssertions();

    const context = createContext();
    castKitShield(context, TRAVELER_CHARACTER_ID, { health: 1, secondsRemaining: 10 });
    stepKitSeconds(context, 10);
    castKitShield(context, TRAVELER_CHARACTER_ID, { health: 1, secondsRemaining: 10 });
    stepKitSeconds(context, 4.9);
    const damageBonusBeforeEnd = priceStrike(context, wielder);
    stepKitSeconds(context, 0.2);

    expect(damageBonusBeforeEnd).toBe(0.28);
    expect(priceStrike(context, wielder)).toBe(0);
  });
});
