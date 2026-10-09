import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInput } from "#src/models/kit/KitInput";

import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { createKitState } from "#src/services/kit/createKitState";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { stepKit } from "#src/services/kit/stepKit";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { createStamina, LocomotionState, STAMINA_MAX } from "genshin-engine";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers([TRAVELER_CHARACTER_ID]));

describe(stepKit, () => {
  const TRAVELER_COMBATANT: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 90,
  };

  const STEP_SECONDS = 0.1;
  const IDLE_INPUT: KitInput = {
    height: 0,
    isAttackHeld: false,
    isAttackPressed: false,
    isBurstPressed: false,
    isSkillHeld: false,
    isSkillPressed: false,
    locomotionState: LocomotionState.Idle,
  };

  // One character's kit, its party member and the stamina it spends, stepped by its input at the fixed step
  const createFixture = () => {
    const kitState = createKitState();
    const landedHits: KitHit[] = [];
    const partyMember = createPartyMember();
    const stamina = createStamina(STAMINA_MAX);
    const step = (input: Partial<KitInput> = {}) => {
      landedHits.length = 0;
      return stepKit(
        kitState,
        TRAVELER_KIT,
        { ...IDLE_INPUT, ...input },
        partyMember,
        stamina,
        STEP_SECONDS,
        landedHits,
        {
          body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
          combatant: TRAVELER_COMBATANT,
          kitEffectState: { effects: [] },
        },
      );
    };
    return { kitState, landedHits, partyMember, stamina, step };
  };

  test("advances the string on each press as the last strike ends", () => {
    expect.hasAssertions();

    const { step } = createFixture();

    expect(step({ isAttackPressed: true })).toBe(TRAVELER_KIT.normalAttacks[0]);
    step();
    step();
    step();
    expect(step()).toBeUndefined();
    expect(step({ isAttackPressed: true })).toBe(TRAVELER_KIT.normalAttacks[1]);
  });

  test("starts the string again once its window has closed", () => {
    expect.hasAssertions();

    const { step } = createFixture();

    step({ isAttackPressed: true });
    for (let index = 0; index < 4; index++) step();
    for (let index = 0; index < 10; index++) step();

    expect(step({ isAttackPressed: true })).toBe(TRAVELER_KIT.normalAttacks[0]);
  });

  test("plays a press queued during a strike as the strike ends", () => {
    expect.hasAssertions();

    const { step } = createFixture();

    step({ isAttackPressed: true });
    step();
    step({ isAttackPressed: true });
    step();

    expect(step()).toBe(TRAVELER_KIT.normalAttacks[1]);
  });

  test("holds a charged attack after a strike, spending its stamina, and gives none with less", () => {
    expect.hasAssertions();

    const { stamina, step } = createFixture();
    const heldInput = { isAttackHeld: true };

    step({ isAttackHeld: true, isAttackPressed: true });
    step(heldInput);
    step(heldInput);
    step(heldInput);

    expect(step(heldInput)).toBe(TRAVELER_KIT.chargedAttack);
    expect(stamina.value).toBe(80);

    const lowStaminaFixture = createFixture();
    lowStaminaFixture.stamina.value = 19;
    lowStaminaFixture.step({ isAttackHeld: true, isAttackPressed: true });
    for (let index = 0; index < 3; index++) lowStaminaFixture.step(heldInput);

    expect(lowStaminaFixture.step(heldInput)).toBeUndefined();
    expect(lowStaminaFixture.stamina.value).toBe(19);
  });

  test("holds a charged attack at its stamina times the kit's multiplier, so none starts it on an empty pool", () => {
    expect.hasAssertions();

    const kit: Kit = { ...TRAVELER_KIT, getChargedAttackStaminaMultiplier: () => 0 };
    const kitState = createKitState();
    const partyMember = createPartyMember();
    const stamina = createStamina(STAMINA_MAX);
    stamina.value = 0;
    const context = {
      body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
      combatant: TRAVELER_COMBATANT,
      kitEffectState: { effects: [] },
    };
    const step = (input: Partial<KitInput>) =>
      stepKit(kitState, kit, { ...IDLE_INPUT, ...input }, partyMember, stamina, STEP_SECONDS, [], context);
    step({ isAttackHeld: true, isAttackPressed: true });
    for (let index = 0; index < 3; index++) step({ isAttackHeld: true });

    expect(step({ isAttackHeld: true })).toBe(kit.chargedAttack);
    expect(stamina.value).toBe(0);
  });

  test("starts a skill only off its cooldown", () => {
    expect.hasAssertions();

    const { partyMember, step } = createFixture();

    expect(step({ isSkillPressed: true })).toBe(TRAVELER_KIT.elementalSkill);
    expect(partyMember.skillCooldownSeconds).toBe(TRAVELER_KIT.skillCooldownSeconds);

    for (let index = 0; index < 11; index++) step();

    expect(step({ isSkillPressed: true })).toBeUndefined();
  });

  test("shortens a skill's cooldown by 5% under Impetuous Winds, composed with the kit's own multiplier", () => {
    expect.hasAssertions();

    const KIT_COOLDOWN_MULTIPLIER = 0.8;
    const IMPETUOUS_WINDS_COOLDOWN_MULTIPLIER = 0.95;
    const partyMember = createPartyMember();
    const kit: Kit = { ...TRAVELER_KIT, getSkillCooldownMultiplier: () => KIT_COOLDOWN_MULTIPLIER };
    stepKit(
      createKitState(),
      kit,
      { ...IDLE_INPUT, isSkillPressed: true },
      partyMember,
      createStamina(STAMINA_MAX),
      STEP_SECONDS,
      [],
      {
        body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
        combatant: { ...TRAVELER_COMBATANT, elementalResonances: [Element.Anemo] },
        kitEffectState: { effects: [] },
      },
    );

    expect(partyMember.skillCooldownSeconds).toBeCloseTo(
      TRAVELER_KIT.skillCooldownSeconds * KIT_COOLDOWN_MULTIPLIER * IMPETUOUS_WINDS_COOLDOWN_MULTIPLIER,
    );
  });

  test("starts a burst only at full energy and empties the energy", () => {
    expect.hasAssertions();

    const { partyMember, step } = createFixture();

    partyMember.energy = TRAVELER_KIT.burstEnergyCost - 1;

    expect(step({ isBurstPressed: true })).toBeUndefined();

    partyMember.energy = TRAVELER_KIT.burstEnergyCost;

    expect(step({ isBurstPressed: true })).toBe(TRAVELER_KIT.elementalBurst);
    expect(partyMember.energy).toBe(0);
    expect(partyMember.burstCooldownSeconds).toBe(TRAVELER_KIT.burstCooldownSeconds);
  });

  test("strikes its collision every 0.3 seconds of a plunge", () => {
    expect.hasAssertions();

    const { landedHits, step } = createFixture();
    const plungeInput = { height: 5, locomotionState: LocomotionState.Plunge };

    step(plungeInput);
    step(plungeInput);
    step(plungeInput);

    expect(landedHits).toStrictEqual([TRAVELER_KIT.plungeCollision]);
  });

  test("lands a high plunge from a drop past 2.4 metres and a low one from less", () => {
    expect.hasAssertions();

    const highFixture = createFixture();
    highFixture.step({ height: 5, locomotionState: LocomotionState.Plunge });

    expect(highFixture.step({ height: 0, locomotionState: LocomotionState.Idle })).toBe(TRAVELER_KIT.highPlunge);

    const lowFixture = createFixture();
    lowFixture.step({ height: 2, locomotionState: LocomotionState.Plunge });

    expect(lowFixture.step({ height: 0, locomotionState: LocomotionState.Idle })).toBe(TRAVELER_KIT.lowPlunge);
  });

  test("ends a strike when the body leaves the ground, and keeps a skill going in the air", () => {
    expect.hasAssertions();

    const strikeFixture = createFixture();
    strikeFixture.step({ isAttackPressed: true });
    strikeFixture.step({ locomotionState: LocomotionState.Jump });

    expect(strikeFixture.kitState.action).toBeUndefined();

    const skillFixture = createFixture();
    skillFixture.step({ isSkillPressed: true });
    skillFixture.step({ locomotionState: LocomotionState.Jump });

    expect(skillFixture.kitState.action).toBe(TRAVELER_KIT.elementalSkill);
  });
});
