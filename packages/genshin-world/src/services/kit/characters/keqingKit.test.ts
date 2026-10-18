import type { Reaction } from "#src/models/combat/Reaction";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKeqingKitBehaviour, KEQING_CHARACTER_ID } from "#src/services/kit/characters/keqingKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { stepKitTestEffects } from "#src/services/kit/effects/stepKitTestEffects.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const KEQING_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, KEQING_CHARACTER_ID);
const KEQING_ENEMY = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const createKeqingCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: KEQING_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: KEQING_KIT,
  level: 90,
  weaponType: WeaponType.Sword,
});

// The buffs a reaction event gives the kit's owner, the striker being whichever character dealt the hit
// The fields of a buff a test names, so the others it holds are not compared
const pickBuffTerms = ({ amount, attribute, secondsRemaining }: KitBuff) => ({ amount, attribute, secondsRemaining });

const getReactionBuffs = (combatant: Combatant, striker: Combatant, reactions: Reaction[]): KitBuff[] => {
  const kitEffectState: KitEffectState = { effects: [] };
  KEQING_KIT.onKitEvent?.(
    { enemy: KEQING_ENEMY, kind: KitEventKind.ReactionTriggered, reactions, striker },
    createKitTestContext(combatant, { kitEffectState }),
    combatant,
  );
  return kitEffectState.effects.filter((effect): effect is KitBuff => effect.kind === "buff");
};

const castStarwardSword = (ascension: number): KitBuff[] => {
  const kitEffectState: KitEffectState = { effects: [] };
  const combatant = { ...createKeqingCombatant(), ascension };
  KEQING_KIT.elementalBurst.onStart?.(createKitTestContext(combatant, { kitEffectState }));
  return kitEffectState.effects.filter((effect): effect is KitBuff => effect.kind === "buff");
};

// The effects the Lightning Stiletto's recast by Keqing at the ascension adds
const castRecast = (ascension: number): KitEffectState["effects"] => {
  const recast = KEQING_KIT.elementalSkillChain?.followUps[0];
  if (!recast) throw new Error("Stellar Restoration has no recast");
  const kitEffectState: KitEffectState = { effects: [] };
  recast.onStart?.(createKitTestContext({ ...createKeqingCombatant(), ascension }, { kitEffectState }));
  return kitEffectState.effects;
};

describe(createKeqingKitBehaviour, () => {
  // Ascension 4's Starward Sword buffs
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(
      castStarwardSword(4).map(({ amount, attribute, secondsRemaining }) => ({ amount, attribute, secondsRemaining })),
    ).toStrictEqual([
      { amount: 0.15, attribute: Attribute.CriticalRate, secondsRemaining: 8 },
      { amount: 0.15, attribute: Attribute.EnergyRecharge, secondsRemaining: 8 },
    ]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(castStarwardSword(3)).toStrictEqual([]);
  });

  test("constellation 4 gives Keqing 25% ATK for 10 seconds on an Electro-related reaction she triggers", () => {
    expect.hasAssertions();
    const combatant = { ...createKeqingCombatant(), constellationCount: 4 };

    expect(
      getReactionBuffs(combatant, combatant, [{ reactionType: ReactionType.Overloaded }]).map((buff) =>
        pickBuffTerms(buff),
      ),
    ).toStrictEqual([{ amount: 0.25, attribute: Attribute.AttackPercent, secondsRemaining: 10 }]);
    expect(
      getReactionBuffs(combatant, combatant, [{ element: Element.Electro, reactionType: ReactionType.Swirl }]),
    ).toHaveLength(1);
  });

  test("constellation 4 gives nothing for another character's reaction, a Cryo Swirl, or below constellation 4", () => {
    expect.hasAssertions();
    const combatant = { ...createKeqingCombatant(), constellationCount: 4 };
    const belowConstellation4 = { ...combatant, constellationCount: 3 };

    expect([
      getReactionBuffs(combatant, { ...combatant, characterId: 1 }, [{ reactionType: ReactionType.Overloaded }]),
      getReactionBuffs(combatant, combatant, [{ element: Element.Cryo, reactionType: ReactionType.Swirl }]),
      getReactionBuffs(belowConstellation4, belowConstellation4, [{ reactionType: ReactionType.Overloaded }]),
    ]).toStrictEqual([[], [], []]);
  });

  test("constellation 6 gives Keqing 6% Electro DMG Bonus for 8 seconds from each kind of action", () => {
    expect.hasAssertions();
    const combatant = { ...createKeqingCombatant(), constellationCount: 6 };
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState });
    KEQING_KIT.normalAttacks[0]?.onStart?.(context);
    KEQING_KIT.chargedAttack.onStart?.(context);
    KEQING_KIT.elementalSkill.onStart?.(context);
    KEQING_KIT.elementalBurst.onStart?.(context);

    expect(
      kitEffectState.effects
        .filter((effect): effect is KitBuff => effect.kind === "buff")
        .map((buff) => pickBuffTerms(buff)),
    ).toStrictEqual(
      Array.from({ length: 4 }, () => ({ amount: 0.06, attribute: Attribute.ElectroDamageBonus, secondsRemaining: 8 })),
    );
  });

  test("constellation 6's bonus from an attack is restarted by the next attack, not stacked", () => {
    expect.hasAssertions();
    const combatant = { ...createKeqingCombatant(), constellationCount: 6 };
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState });
    KEQING_KIT.normalAttacks[0]?.onStart?.(context);
    KEQING_KIT.normalAttacks[0]?.onStart?.(context);

    expect(kitEffectState.effects).toHaveLength(1);
  });

  test("constellation 1's recast adds an Electro hit of 50% ATK as it starts and one at its hitmark", () => {
    expect.hasAssertions();
    const recast = KEQING_KIT.elementalSkillChain?.followUps[0];
    if (!recast) throw new Error("Stellar Restoration has no recast");
    const combatant = { ...createKeqingCombatant(), constellationCount: 1 };
    const context = createKitTestContext(combatant, {
      enemyMap: new Map([["enemy", KEQING_ENEMY]]),
      kitEffectState: { effects: [] },
    });
    recast.onStart?.(context);

    const early = stepKitTestEffects(0.1, context);
    const late = stepKitTestEffects(1.5, context);
    expect([early, late].map((strikes) => strikes.map(({ hit }) => [hit.element, hit.talentMultiplier]))).toStrictEqual(
      [[[Element.Electro, 0.5]], [[Element.Electro, 0.5]]],
    );
  });

  test("a recast below constellation 1 adds no Electro hit", () => {
    expect.hasAssertions();
    const recast = KEQING_KIT.elementalSkillChain?.followUps[0];
    if (!recast) throw new Error("Stellar Restoration has no recast");
    const context = createKitTestContext(createKeqingCombatant(), {
      enemyMap: new Map([["enemy", KEQING_ENEMY]]),
      kitEffectState: { effects: [] },
    });
    recast.onStart?.(context);

    expect(stepKitTestEffects(2, context)).toStrictEqual([]);
  });
});

describe("thundering Penance", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(castRecast(1)).toStrictEqual([
      { characterId: KEQING_CHARACTER_ID, element: Element.Electro, kind: "infusion", secondsRemaining: 5 },
    ]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(castRecast(0)).toStrictEqual([]);
  });
});
