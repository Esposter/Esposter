import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { COLLEI_CHARACTER_ID, createColleiKitBehaviour } from "#src/services/kit/characters/colleiKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const COLLEI_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, COLLEI_CHARACTER_ID);
const createColleiCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: COLLEI_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: COLLEI_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

const castEffects = (action: KitAction): KitEffect[] => {
  const kitEffectState: KitEffectState = { effects: [] };
  action.onStart?.(createKitTestContext(createColleiCombatant(), { kitEffectState }));
  return kitEffectState.effects;
};

describe(createColleiKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...COLLEI_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      takeOne(COLLEI_KIT.chargedAttack.hits).talentMultiplier,
      COLLEI_KIT.plungeCollision.talentMultiplier,
      takeOne(COLLEI_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(COLLEI_KIT.highPlunge.hits).talentMultiplier,
      takeOne(COLLEI_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(COLLEI_KIT.elementalBurst.hits).talentMultiplier,
    ];

    expect(multipliers).toStrictEqual([
      0.43602, 0.42656, 0.54094, 0.68026, 1.24, 0.568288, 1.136335, 1.419344, 1.512, 2.01824,
    ]);
  });

  test("the skill and burst cooldowns and the burst's energy cost come from the table", () => {
    expect.hasAssertions();

    expect(COLLEI_KIT.skillCooldownSeconds).toBe(12);
    expect(COLLEI_KIT.burstCooldownSeconds).toBe(15);
    expect(COLLEI_KIT.burstEnergyCost).toBe(60);
  });

  test("the Floral Brush hits land at 34 and 138 frames, the second past the skill's 68-frame animation", () => {
    expect.hasAssertions();

    expect(COLLEI_KIT.elementalSkill.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))).toStrictEqual([
      34, 138,
    ]);
    expect(Math.round(COLLEI_KIT.elementalSkill.seconds * 60)).toBe(68);
  });

  test("the fully charged shot's arrow lands 10 frames after its 86-frame hitmark", () => {
    expect.hasAssertions();

    expect(Math.round(takeOne(COLLEI_KIT.chargedAttack.hits).hitmarkSeconds * 60)).toBe(96);
  });

  test("the Trump-Card Kitty explosion lands at 25 frames and its leap ticks from 68 frames, every 30", () => {
    expect.hasAssertions();
    const field = castEffects(COLLEI_KIT.elementalBurst).find((effect): effect is KitField => effect.kind === "field");
    const kitEffectState: KitEffectState = { effects: [] };
    field?.onTick(
      createKitTestContext(createColleiCombatant(), { characterIdCombatantMap: new Map(), kitEffectState }),
      0,
    );
    const tickSummon = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(Math.round(takeOne(COLLEI_KIT.elementalBurst.hits).hitmarkSeconds * 60)).toBe(25);
    expect(Math.round((field?.nextTickSeconds ?? 0) * 60)).toBe(68);
    expect(Math.round((field?.tickIntervalSeconds ?? 0) * 60)).toBe(30);
    expect(tickSummon?.hits.map(({ talentMultiplier }) => talentMultiplier)).toStrictEqual([0.43248]);
  });

  test("the kitty's status runs 378 frames from its explosion, as gcsim gives it", () => {
    expect.hasAssertions();
    const field = castEffects(COLLEI_KIT.elementalBurst).find((effect): effect is KitField => effect.kind === "field");

    expect(Math.round((field?.secondsRemaining ?? 0) * 60)).toBe(403);
  });

  test("each leap lands where the kitty was cast, whatever the body does after", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createColleiCombatant());
    COLLEI_KIT.elementalBurst.onStart?.(context);
    const field = context.kitEffectState.effects.find((effect): effect is KitField => effect.kind === "field");
    context.body.position.x = 1;
    field?.onTick(context, 0);
    const tickSummon = context.kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(tickSummon?.body.position).toStrictEqual({ x: 0, z: 0 });
  });
});
