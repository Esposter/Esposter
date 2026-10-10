import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { CHONGYUN_CHARACTER_ID } from "#src/services/character/constants";
import { createChongyunKit } from "#src/services/kit/characters/chongyunKit";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const CHONGYUN_KIT = createChongyunKit(await readTalentMultipliers([CHONGYUN_CHARACTER_ID]));

const createChongyunCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: CHONGYUN_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: CHONGYUN_KIT,
  level: 90,
});

describe(createChongyunKit, () => {
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
  // The effects an action's start adds, as the kit's effects hold them
  const castEffects = (action: KitAction): KitEffect[] => {
    const kitEffectState: KitEffectState = { effects: [] };
    action.onStart?.({ body: kitBody, combatant: createChongyunCombatant(), kitEffectState });
    return kitEffectState.effects;
  };

  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...CHONGYUN_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...CHONGYUN_KIT.chargedAttack.hits.map((hit) => hit.talentMultiplier),
      CHONGYUN_KIT.plungeCollision.talentMultiplier,
      takeOne(CHONGYUN_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(CHONGYUN_KIT.highPlunge.hits).talentMultiplier,
      takeOne(CHONGYUN_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(CHONGYUN_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.70004, 0.63124, 0.80324, 1.01222, 0.562853, 1.01781, 0.745878, 1.49144, 1.862889, 1.7204, 1.424,
    ];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("the skill's Cryo hit lands at 36 frames for 2U of Cryo and 150 poise", () => {
    expect.hasAssertions();
    const [skillHit] = CHONGYUN_KIT.elementalSkill.hits;

    expect(skillHit?.element).toBe(Element.Cryo);
    expect(skillHit?.gauge).toBe(2);
    expect(skillHit?.hitmarkSeconds).toBeCloseTo(36 / 60);
    expect(skillHit?.poiseDamage).toBe(150);
  });

  test("the field infuses the active character with Cryo each second from the hit, for the table's infusion seconds", () => {
    expect.hasAssertions();
    const field = castEffects(CHONGYUN_KIT.elementalSkill).find(
      (effect): effect is KitField => effect.kind === "field",
    );
    const kitEffectState: KitEffectState = { effects: [] };
    field?.onTick({
      activeCombatant: createChongyunCombatant(),
      kitEffectState,
      party: createParty([CHONGYUN_CHARACTER_ID]),
      tickIndex: 0,
    });

    expect(field?.nextTickSeconds).toBeCloseTo(36 / 60);
    expect(field?.radius).toBe(8);
    expect(field?.tickIntervalSeconds).toBe(1);
    expect(field?.secondsRemaining).toBeCloseTo(10 + 36 / 60 + 0.1);
    expect(kitEffectState.effects).toStrictEqual([
      { characterId: CHONGYUN_CHARACTER_ID, element: Element.Cryo, kind: "infusion", secondsRemaining: 2 },
    ]);
  });

  test("the burst's three blades land at 50, 59 and 67 frames, and its animation lasts 79", () => {
    expect.hasAssertions();
    const hitmarks = CHONGYUN_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60));

    expect(hitmarks).toStrictEqual([50, 59, 67]);
    expect(CHONGYUN_KIT.elementalBurst.seconds).toBeCloseTo(79 / 60);
  });

  test("the skill's cooldown, the burst's cooldown and energy cost come from the dump's groups", () => {
    expect.hasAssertions();

    expect(CHONGYUN_KIT.skillCooldownSeconds).toBe(15);
    expect(CHONGYUN_KIT.burstCooldownSeconds).toBe(12);
    expect(CHONGYUN_KIT.burstEnergyCost).toBe(40);
  });
});
