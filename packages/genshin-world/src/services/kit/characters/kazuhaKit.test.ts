import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKazuhaKit, KAZUHA_CHARACTER_ID } from "#src/services/kit/characters/kazuhaKit";
import { createKitEventContext } from "#src/services/kit/createKitEventContext.test";
import { createKitStepContext } from "#src/services/kit/createKitStepContext.test";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const KAZUHA_KIT = createKazuhaKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [KAZUHA_CHARACTER_ID]));
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

describe(createKazuhaKit, () => {
  test("constellation 1 takes a tenth off Chihayaburu's cooldown", () => {
    expect.hasAssertions();
    const body = { facing: 0, height: 0, position: { x: 0, z: 0 } };
    const cooldown = (constellationCount: number) =>
      KAZUHA_KIT.skillCooldownSeconds *
      (KAZUHA_KIT.getSkillCooldownMultiplier?.(
        createKitStepContext(createKazuhaCombatant(constellationCount), { body }),
      ) ?? 1);

    expect(cooldown(0)).toBeCloseTo(6);
    expect(cooldown(1)).toBeCloseTo(5.4);
  });

  test("constellation 6 gives Anemo to Kazuha's attacks as Chihayaburu is cast", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };

    KAZUHA_KIT.elementalSkill.onStart?.(createKitStepContext(createKazuhaCombatant(6), { kitEffectState }));

    expect(kitEffectState.effects).toStrictEqual([
      { characterId: KAZUHA_CHARACTER_ID, element: Element.Anemo, kind: "infusion", secondsRemaining: 5 },
    ]);
  });

  test("the Autumn Whirlwind lands the absorbed element's tick ahead of each tick still to come, absorbing once", () => {
    expect.hasAssertions();
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const context = createKitEventContext(createKazuhaCombatant(), { enemyMap: new Map([[enemy.id, enemy]]) });
    KAZUHA_KIT.elementalBurst.onStart?.(context);
    const [whirlwind, absorbField] = context.kitEffectState.effects;
    if (whirlwind?.kind !== "summon" || absorbField?.kind !== "field") throw new Error("The burst casts no whirlwind");
    // The first tick has landed, so only the four still to come take the absorbed element's tick
    whirlwind.elapsedSeconds = takeOne(whirlwind.hits).hitmarkSeconds;
    const absorb = (element: Element) => {
      enemy.elementalState.auras.clear();
      applyElement(enemy.elementalState, element, 1);
      absorbField.onTick({ ...context, tickIndex: 0 });
    };
    absorb(Element.Cryo);
    absorb(Element.Pyro);

    expect(whirlwind.hits.map(({ element, talentMultiplier }) => `${element} ${talentMultiplier}`)).toStrictEqual([
      `${Element.Anemo} 1.2`,
      ...Array.from({ length: 4 }, () => [`${Element.Cryo} 0.36`, `${Element.Anemo} 1.2`]).flat(),
    ]);
  });
});
