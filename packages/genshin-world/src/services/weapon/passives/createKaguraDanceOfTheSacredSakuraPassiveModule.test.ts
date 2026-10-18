import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createKaguraDanceOfTheSacredSakuraPassiveModule } from "#src/services/weapon/passives/createKaguraDanceOfTheSacredSakuraPassiveModule";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};

const readPyroDamageBonus = ({ kitEffectState }: KitContext): number =>
  kitEffectState.effects
    .filter((effect) => effect.kind === "buff" && effect.attribute === Attribute.PyroDamageBonus)
    .reduce((sum, effect) => sum + (effect.kind === "buff" ? effect.amount : 0), 0);

describe(createKaguraDanceOfTheSacredSakuraPassiveModule, () => {
  // Kagura Dance of the Sacred Sakura at its first rank: each Elemental Skill adds a stack of 12% Elemental Skill DMG
  // And 12% Stellar-Conduct DMG for 24 seconds, up to three, and three stacks give 12% All Elemental DMG Bonus
  const passiveModule = createKaguraDanceOfTheSacredSakuraPassiveModule([0.12, 24, 0.12, 0.12]);
  const useSkills = (context: KitContext, count: number) => {
    for (let index = 0; index < count; index++)
      passiveModule.onKitEvent?.(
        { characterId: TRAVELER_CHARACTER_ID, kind: KitEventKind.SkillUsed },
        context,
        wielder,
      );
  };
  const priceStrike = ({ body, kitEffectState, party }: KitContext, attackTag: AttackTag): number => {
    const strike: KitStrike = { attackTag, body, combatant: wielder, hit: TRAVELER_KIT.plungeCollision };
    return passiveModule.getStrikeDamageBonus?.(strike, enemy, party, kitEffectState.effects) ?? 0;
  };
  const priceStellarConduct = (context: KitContext): number =>
    passiveModule.getPartyReactionBonus?.(
      wielder,
      { combatant: wielder, element: Element.Electro, enemy, reactionType: StellarReactionType.StellarConduct },
      context,
    )?.damageBonus ?? 0;

  test.each([
    [1, 0.12, 0],
    [3, 0.36, 0.12],
    [4, 0.36, 0.12],
  ])(
    "%s Elemental Skills raise Elemental Skill and Stellar-Conduct DMG by %s and All Elemental DMG by %s",
    (skills, damageBonus, elementalDamageBonus) => {
      expect.hasAssertions();

      const context = createKitTestContext(wielder);
      useSkills(context, skills);

      expect(priceStrike(context, AttackTag.ElementalSkill)).toBeCloseTo(damageBonus);
      expect(priceStrike(context, AttackTag.NormalAttack)).toBe(0);
      expect(priceStellarConduct(context)).toBeCloseTo(damageBonus);
      expect(readPyroDamageBonus(context)).toBe(elementalDamageBonus);
    },
  );

  test("its stacks end together 24 seconds after the last skill, and the next skill starts them from one", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    useSkills(context, 2);
    stepKitSeconds(context, 20);
    useSkills(context, 1);
    stepKitSeconds(context, 20);
    const stillDancing = priceStrike(context, AttackTag.ElementalSkill);
    stepKitSeconds(context, 4.1);
    const ended = priceStrike(context, AttackTag.ElementalSkill);
    useSkills(context, 1);

    expect(stillDancing).toBeCloseTo(0.36);
    expect(ended).toBe(0);
    expect(priceStrike(context, AttackTag.ElementalSkill)).toBeCloseTo(0.12);
  });
});
