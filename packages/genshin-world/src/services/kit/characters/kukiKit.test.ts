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
import { createKukiKitBehaviour, KUKI_CHARACTER_ID } from "#src/services/kit/characters/kukiKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const KUKI_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, KUKI_CHARACTER_ID);
const createKukiCombatant = (ascension = 0, constellationCount = 0, elementalMastery = 0): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseHealth, value: 10_000 },
    { attribute: Attribute.ElementalMastery, value: elementalMastery },
  ]),
  characterId: KUKI_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: KUKI_KIT,
  level: 90,
  weaponType: WeaponType.Catalyst,
});

// The effects an action's start adds, as the kit's effects hold them
const castEffects = (action: KitAction, combatant = createKukiCombatant()): KitEffect[] => {
  const kitEffectState: KitEffectState = { effects: [] };
  action.onStart?.(createKitTestContext(combatant, { kitEffectState }));
  return kitEffectState.effects;
};

const castSummon = (action: KitAction): KitSummon | undefined =>
  castEffects(action).find((effect): effect is KitSummon => effect.kind === "summon");

const ringSeconds = (constellationCount: number): number =>
  castEffects(KUKI_KIT.elementalSkill, createKukiCombatant(0, constellationCount))
    .filter((effect): effect is KitField => effect.kind === "field")
    .find((field) => Number.isFinite(field.tickIntervalSeconds))?.secondsRemaining ?? 0;

describe(createKukiKitBehaviour, () => {
  test("reads the strikes', charged slashes' and plunges' multipliers from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...KUKI_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...KUKI_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      KUKI_KIT.plungeCollision.talentMultiplier,
      takeOne(KUKI_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(KUKI_KIT.highPlunge.hits).talentMultiplier,
    ];
    const expectedMultipliers = [0.48762, 0.44548, 0.5934, 0.7611, 0.556334, 0.667652, 0.639324, 1.278377, 1.596762];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("the charged attack costs 20 stamina, and her burst costs 60 energy and cools for 15 seconds", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: KUKI_KIT.burstCooldownSeconds,
      burstEnergyCost: KUKI_KIT.burstEnergyCost,
      chargedAttackStamina: KUKI_KIT.chargedAttackStamina,
      skillCooldownSeconds: KUKI_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 15,
      burstEnergyCost: 60,
      chargedAttackStamina: 20,
      skillCooldownSeconds: 15,
    });
  });

  test("gyoei Narukami Kariyama Rite's seven hits land from 50 frames every 17, each a share of her Max HP", () => {
    expect.hasAssertions();
    const hits = castSummon(KUKI_KIT.elementalBurst)?.hits ?? [];

    expect(hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))).toStrictEqual([
      50, 67, 84, 101, 118, 135, 152,
    ]);
    expect(takeOne(hits).additiveBaseDamageBonus?.(createKukiCombatant())).toBeCloseTo(360.48);
  });

  test("the Grass Ring lasts 12 seconds from its 23rd frame, and 15 from Constellation 2", () => {
    expect.hasAssertions();

    expect(ringSeconds(1)).toBeCloseTo(23 / 60 + 12 + 0.1);
    expect(ringSeconds(2)).toBeCloseTo(23 / 60 + 15 + 0.1);
  });

  test("each Grass Ring tick heals the active character and strikes 2 frames after it, from the 113th frame every 90", () => {
    expect.hasAssertions();
    const ring = castEffects(KUKI_KIT.elementalSkill)
      .filter((effect): effect is KitField => effect.kind === "field")
      .find((field) => Number.isFinite(field.tickIntervalSeconds));
    const context = createKitTestContext(createKukiCombatant());
    getPartyMember(context.party, KUKI_CHARACTER_ID).healthShare = 0.5;
    ring?.onTick(context, 0);
    const tickSummon = context.kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(ring?.nextTickSeconds).toBeCloseTo(113 / 60);
    expect(ring?.tickIntervalSeconds).toBeCloseTo(90 / 60);
    expect(getPartyMember(context.party, KUKI_CHARACTER_ID).healthShare).toBeCloseTo(0.5 + 0.2524 + 288.8908 / 10_000);
    expect(takeOne(tickSummon?.hits ?? []).hitmarkSeconds).toBeCloseTo(2 / 60);
  });

  test("the cast drains 30% of her health share, and no further than 20%", () => {
    expect.hasAssertions();
    const drain = castEffects(KUKI_KIT.elementalSkill).find(
      (effect): effect is KitField =>
        effect.kind === "field" && effect.tickIntervalSeconds === Number.POSITIVE_INFINITY,
    );
    const drainTo = (healthShare: number): number => {
      const context = createKitTestContext(createKukiCombatant());
      getPartyMember(context.party, KUKI_CHARACTER_ID).healthShare = healthShare;
      drain?.onTick(context, 0);
      return getPartyMember(context.party, KUKI_CHARACTER_ID).healthShare;
    };

    expect(drainTo(1)).toBeCloseTo(0.7);
    expect(drainTo(0.25)).toBeCloseTo(0.2);
  });

  test("the initial hit adds a quarter of her Elemental Mastery to its base damage", () => {
    expect.hasAssertions();
    expect(takeOne(KUKI_KIT.elementalSkill.hits).additiveBaseDamageBonus?.(createKukiCombatant(0, 0, 200))).toBeCloseTo(
      50,
    );
  });
});

describe("breaking Free", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(KUKI_KIT.getPassiveBonuses?.(createKukiCombatant(1), 0.5, [])).toStrictEqual([
      { amount: 0.15, attribute: Attribute.HealingBonus },
    ]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(KUKI_KIT.getPassiveBonuses?.(createKukiCombatant(0), 0.5, [])).toStrictEqual([]);
  });
});
