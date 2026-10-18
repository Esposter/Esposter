import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKazuhaKitBehaviour, KAZUHA_CHARACTER_ID } from "#src/services/kit/characters/kazuhaKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const KAZUHA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, KAZUHA_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createKazuhaCombatant = (constellationCount = 0): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: KAZUHA_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: KAZUHA_KIT,
  level: 90,
  weaponType: WeaponType.Sword,
});

const getSkillCooldownSeconds = (constellationCount: number): number =>
  KAZUHA_KIT.skillCooldownSeconds *
  (KAZUHA_KIT.getSkillCooldownMultiplier?.(createKitTestContext(createKazuhaCombatant(constellationCount))) ?? 1);

describe(createKazuhaKitBehaviour, () => {
  test("constellation 1 takes a tenth off Chihayaburu's cooldown", () => {
    expect.hasAssertions();

    expect(getSkillCooldownSeconds(0)).toBeCloseTo(6);
    expect(getSkillCooldownSeconds(1)).toBeCloseTo(5.4);
  });

  test("constellation 6 gives Anemo to Kazuha's attacks as Chihayaburu is cast", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };

    KAZUHA_KIT.elementalSkill.onStart?.(createKitTestContext(createKazuhaCombatant(6), { kitEffectState }));

    expect(kitEffectState.effects).toStrictEqual([
      { characterId: KAZUHA_CHARACTER_ID, element: Element.Anemo, kind: "infusion", secondsRemaining: 5 },
    ]);
  });

  test("the Autumn Whirlwind lands the absorbed element's tick ahead of each tick still to come, absorbing once", () => {
    expect.hasAssertions();
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const context = createKitTestContext(createKazuhaCombatant(), { enemyMap: new Map([[enemy.id, enemy]]) });
    KAZUHA_KIT.elementalBurst.onStart?.(context);
    const [whirlwind, absorbField] = context.kitEffectState.effects;
    if (whirlwind?.kind !== "summon" || absorbField?.kind !== "field") throw new Error("The burst casts no whirlwind");
    // The first tick has landed, so only the four still to come take the absorbed element's tick
    whirlwind.elapsedSeconds = takeOne(whirlwind.hits).hitmarkSeconds;
    const absorb = (element: Element) => {
      enemy.elementalState.auras.clear();
      applyElement(enemy.elementalState, element, 1);
      absorbField.onTick(context, 0);
    };
    absorb(Element.Cryo);
    absorb(Element.Pyro);

    expect(whirlwind.hits.map(({ element, talentMultiplier }) => `${element} ${talentMultiplier}`)).toStrictEqual([
      `${Element.Anemo} 1.2`,
      ...Array.from({ length: 4 }, () => [`${Element.Cryo} 0.36`, `${Element.Anemo} 1.2`]).flat(),
    ]);
  });
});

describe("poetics of Fuubutsu", () => {
  const TEAMMATE_CHARACTER_ID = 1;

  // The buffs a Pyro Swirl Kazuha triggers gives the team, with her at the given ascension and Elemental Mastery
  const readSwirlBuffs = (ascension: number, elementalMastery: number): KitEffectState["effects"] => {
    const combatant = {
      ...createKazuhaCombatant(),
      ascension,
      attributes: computeCharacterAttributes([
        { attribute: Attribute.BaseHealth, value: 10_000 },
        { attribute: Attribute.ElementalMastery, value: elementalMastery },
      ]),
    };
    const context = createKitTestContext(combatant, {
      party: createParty([KAZUHA_CHARACTER_ID, TEAMMATE_CHARACTER_ID]),
    });
    KAZUHA_KIT.onKitEvent?.(
      {
        enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
        kind: KitEventKind.ReactionTriggered,
        reactions: [{ element: Element.Pyro, reactionType: ReactionType.Swirl }],
        striker: combatant,
      },
      context,
      combatant,
    );
    return context.kitEffectState.effects;
  };

  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(readSwirlBuffs(4, 1000)).toStrictEqual(
      [KAZUHA_CHARACTER_ID, TEAMMATE_CHARACTER_ID].map((characterId) => ({
        amount: 0.0004 * 1000,
        attribute: Attribute.PyroDamageBonus,
        characterId,
        kind: "buff",
        secondsRemaining: 8,
        source: "kazuha-poetics-of-fuubutsu",
      })),
    );
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(readSwirlBuffs(3, 1000)).toStrictEqual([]);
  });
});
