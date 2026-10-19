import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { FISCHL_CHARACTER_ID } from "#src/services/kit/characters/fischlKit";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { castKitShield } from "#src/services/kit/effects/castKitShield";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { createCrownOfTheFinalScionPassiveModule } from "#src/services/weapon/passives/createCrownOfTheFinalScionPassiveModule";
import { OTHER_CHARACTER_ID } from "#src/services/weapon/passives/createPassiveTestHelpers.test";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

const createCombatant = (characterId: number, kit: Kit, attack = 0): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseAttack, value: attack }]),
  characterId,
  constellationCount: 0,
  elementalResonances: [],
  kit,
  level: 1,
});

const castShield = (context: KitContext, characterId = TRAVELER_CHARACTER_ID) =>
  castKitShield(context, characterId, { health: 1, secondsRemaining: 10 });
const readEnergy = (context: KitContext) => getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy;

describe(createCrownOfTheFinalScionPassiveModule, () => {
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");

  // Crown of the Final Scion at its first rank: a shield its wielder casts gives Pathfinder's Light for 20 seconds, the
  // Member on the field dealing 10% more DMG for each 1,000 of the wielder's ATK, up to 26%, and an off-field Hexerei
  // Member half of it, and restores the wielder 14 Energy, once every 14 seconds
  const passiveModule = createCrownOfTheFinalScionPassiveModule([0.12, 1000, 0.1, 0.26, 20, 14, 14, 0.5]);
  const other = createCombatant(OTHER_CHARACTER_ID, TRAVELER_KIT);
  const hexerei = createCombatant(FISCHL_CHARACTER_ID, TRAVELER_KIT);
  // The team of a wielder with the given ATK, on the field, another member and a Hexerei member
  const createContext = (attack: number) => {
    const wielder = createCombatant(TRAVELER_CHARACTER_ID, getPassiveKit(TRAVELER_KIT, [passiveModule]), attack);
    const context = createKitTestContext(wielder, {
      characterIdCombatantMap: new Map([
        [TRAVELER_CHARACTER_ID, wielder],
        [OTHER_CHARACTER_ID, other],
        [FISCHL_CHARACTER_ID, hexerei],
      ]),
      party: createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID, FISCHL_CHARACTER_ID]),
    });
    getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy = 0;
    return { context, wielder };
  };
  // The DMG Bonus a strike by the given member takes from the wielder's weapon: its own hook for the wielder's strike,
  // And the party hook it lends the others
  const priceStrike = (context: KitContext, wielder: Combatant, striker: Combatant): number => {
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
    [2000, 0.2],
    [4000, 0.26],
  ])("a shield the wielder casts at %s ATK raises the DMG of the member on the field by %s", (attack, damageBonus) => {
    expect.hasAssertions();

    const { context, wielder } = createContext(attack);
    castShield(context);
    const wielderDamageBonus = priceStrike(context, wielder, wielder);
    context.party.activeIndex = 1;

    expect(wielderDamageBonus).toBeCloseTo(damageBonus);
    expect(priceStrike(context, wielder, other)).toBeCloseTo(damageBonus);
  });

  test("an off-field Hexerei member gains half of it, and another off-field member none", () => {
    expect.hasAssertions();

    const { context, wielder } = createContext(2000);
    castShield(context);

    expect(priceStrike(context, wielder, hexerei)).toBeCloseTo(0.1);
    expect(priceStrike(context, wielder, other)).toBe(0);
  });

  test("its Pathfinder's Light ends after 20 seconds", () => {
    expect.hasAssertions();

    const { context, wielder } = createContext(2000);
    castShield(context);
    stepKitSeconds(context, 19.9);
    const damageBonusBeforeEnd = priceStrike(context, wielder, wielder);
    stepKitSeconds(context, 0.2);

    expect(damageBonusBeforeEnd).toBeCloseTo(0.2);
    expect(priceStrike(context, wielder, wielder)).toBe(0);
  });

  test("a shield another member casts gives nothing", () => {
    expect.hasAssertions();

    const { context, wielder } = createContext(2000);
    castShield(context, OTHER_CHARACTER_ID);

    expect(priceStrike(context, wielder, wielder)).toBe(0);
    expect(readEnergy(context)).toBe(0);
  });

  test("its Guide's Contentment restores 14 Energy once every 14 seconds, a chest opened included", () => {
    expect.hasAssertions();

    const { context } = createContext(2000);
    castShield(context);
    emitKitEvent({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.ChestOpened }, context);
    const energyWithinCooldown = readEnergy(context);
    stepKitSeconds(context, 14);
    emitKitEvent({ characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.ChestOpened }, context);

    expect(energyWithinCooldown).toBe(14);
    expect(readEnergy(context)).toBe(28);
  });
});
