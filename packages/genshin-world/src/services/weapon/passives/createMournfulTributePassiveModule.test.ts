import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitContext } from "#src/models/kit/KitContext";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { getPassiveKit } from "#src/services/kit/getPassiveKit";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { OTHER_CHARACTER_ID } from "#src/services/weapon/passives/constants.test";
import { createMournfulTributePassiveModule } from "#src/services/weapon/passives/createMournfulTributePassiveModule";
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

const readEnergy = (context: KitContext) => getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy;

describe(createMournfulTributePassiveModule, () => {
  // Mournful Tribute at its first rank: for 3.5 seconds after its wielder's burst, its Lunar-Charged DMG rises 36%, and
  // A Lunar-Charged it triggers gives Requiem of Ruin, 28% CRIT DMG for 6 seconds, and 12 Energy once every 14 seconds
  const passiveModule = createMournfulTributePassiveModule([3.5, 0.36, 6, 0.28, 12, 14]);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const wielder = createCombatant(TRAVELER_CHARACTER_ID, getPassiveKit(TRAVELER_KIT, [passiveModule]));
  const other = createCombatant(OTHER_CHARACTER_ID, TRAVELER_KIT);
  const createContext = (): KitContext =>
    createKitTestContext(wielder, {
      characterIdCombatantMap: new Map([
        [OTHER_CHARACTER_ID, other],
        [TRAVELER_CHARACTER_ID, wielder],
      ]),
      party: createParty([TRAVELER_CHARACTER_ID, OTHER_CHARACTER_ID]),
    });
  const useBurst = (context: KitContext) =>
    passiveModule.onKitEvent?.(
      { characterId: TRAVELER_CHARACTER_ID, energyCost: 60, kind: KitEventKind.BurstUsed },
      context,
      wielder,
    );
  const triggerReaction = (
    context: KitContext,
    reactionType: LunarReactionType | TransformativeReactionType,
    striker = wielder,
  ) =>
    passiveModule.onKitEvent?.(
      { enemy, kind: KitEventKind.ReactionTriggered, reactions: [{ reactionType }], striker },
      context,
      wielder,
    );
  // The DMG Bonus the wielder's weapon gives a reaction of the type the given member makes
  const priceReaction = (
    context: KitContext,
    reactionType: LunarReactionType | TransformativeReactionType,
    combatant = wielder,
  ): number =>
    passiveModule.getPartyReactionBonus?.(
      wielder,
      { combatant, element: Element.Electro, enemy, reactionType },
      context,
    ).damageBonus ?? 0;
  const readBonuses = (context: KitContext) =>
    passiveModule.getPassiveBonuses?.(wielder, 1, [], context.kitEffectState.effects);

  test("for 3.5 seconds after the wielder's burst, its Lunar-Charged DMG rises 36%", () => {
    expect.hasAssertions();

    const context = createContext();
    useBurst(context);
    const damageBonuses = [
      priceReaction(context, LunarReactionType.LunarCharged),
      priceReaction(context, LunarReactionType.LunarBloom),
      priceReaction(context, LunarReactionType.LunarCharged, other),
    ];
    stepKitSeconds(context, 3.5);

    expect(damageBonuses).toStrictEqual([0.36, 0, 0]);
    expect(priceReaction(context, LunarReactionType.LunarCharged)).toBe(0);
  });

  test("a Lunar-Charged the wielder triggers gives Requiem of Ruin, 28% CRIT DMG for 6 seconds", () => {
    expect.hasAssertions();

    const context = createContext();
    triggerReaction(context, LunarReactionType.LunarCharged);
    const bonuses = readBonuses(context);
    stepKitSeconds(context, 6);

    expect(bonuses).toStrictEqual([{ amount: 0.28, attribute: Attribute.CriticalDamage }]);
    expect(readBonuses(context)).toStrictEqual([]);
  });

  test.each([
    ["another reaction the wielder triggers", TransformativeReactionType.Overloaded, wielder, 0],
    ["a Lunar-Charged another member triggers", LunarReactionType.LunarCharged, other, 0],
    ["a Lunar-Charged the wielder triggers off the field", LunarReactionType.LunarCharged, wielder, 1],
  ])("%s gives nothing", (_title, reactionType, striker, activeIndex) => {
    expect.hasAssertions();

    const context = createContext();
    context.party.activeIndex = activeIndex;
    triggerReaction(context, reactionType, striker);

    expect(readBonuses(context)).toStrictEqual([]);
    expect(readEnergy(context)).toBe(0);
  });

  test("a Lunar-Charged the wielder triggers restores 12 Energy, once every 14 seconds", () => {
    expect.hasAssertions();

    const context = createContext();
    triggerReaction(context, LunarReactionType.LunarCharged);
    stepKitSeconds(context, 13.9);
    triggerReaction(context, LunarReactionType.LunarCharged);
    const energyInsideCooldown = readEnergy(context);
    stepKitSeconds(context, 0.1);
    triggerReaction(context, LunarReactionType.LunarCharged);

    expect(energyInsideCooldown).toBe(12);
    expect(readEnergy(context)).toBe(24);
  });
});
