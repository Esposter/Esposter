import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInput } from "#src/models/kit/KitInput";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { BENNETT_CHARACTER_ID } from "#src/services/kit/characters/bennettKit";
import { createKitState } from "#src/services/kit/createKitState";
import { CHARGED_ATTACK_HOLD_SECONDS, STRIKE_TARGETING_AREA } from "#src/services/kit/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { completeKitSkillCharge } from "#src/services/kit/effects/completeKitSkillCharge";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { startKitAction } from "#src/services/kit/startKitAction";
import { startNextKitAction } from "#src/services/kit/startNextKitAction";
import { stepKit } from "#src/services/kit/stepKit";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { takeOne } from "@esposter/shared";
import { createStamina, LocomotionState, STAMINA_MAX } from "genshin-engine";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const BENNETT_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, BENNETT_CHARACTER_ID);

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
  // The steps the first strike takes to end, counting the one that starts it out
  const STRIKE_STEP_COUNT = Math.ceil(takeOne(TRAVELER_KIT.normalAttacks, 0).seconds / STEP_SECONDS);
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
  const createFixture = (kit: Kit = TRAVELER_KIT) => {
    const kitState = createKitState();
    const landedHits: KitHit[] = [];
    const partyMember = createPartyMember();
    const stamina = createStamina(STAMINA_MAX);
    const step = (input: Partial<KitInput> = {}) => {
      landedHits.length = 0;
      return stepKit(
        kitState,
        kit,
        { ...IDLE_INPUT, ...input },
        partyMember,
        stamina,
        STEP_SECONDS,
        landedHits,
        createKitTestContext(TRAVELER_COMBATANT),
      );
    };
    return { kitState, landedHits, partyMember, stamina, step };
  };

  test("advances the string on each press as the last strike ends", () => {
    expect.hasAssertions();

    const { step } = createFixture();

    expect(step({ isAttackPressed: true })).toBe(TRAVELER_KIT.normalAttacks[0]);
    for (let index = 0; index < STRIKE_STEP_COUNT - 1; index++) step();

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
    for (let index = 0; index < STRIKE_STEP_COUNT - 3; index++) step();

    expect(step()).toBe(TRAVELER_KIT.normalAttacks[1]);
  });

  test("holds a charged attack after a strike, spending its stamina, and gives none with less", () => {
    expect.hasAssertions();

    const { stamina, step } = createFixture();
    const heldInput = { isAttackHeld: true };

    step({ isAttackHeld: true, isAttackPressed: true });
    for (let index = 0; index < STRIKE_STEP_COUNT - 1; index++) step(heldInput);

    expect(step(heldInput)).toBe(TRAVELER_KIT.chargedAttack);
    expect(stamina.value).toBe(80);

    const lowStaminaFixture = createFixture();
    lowStaminaFixture.stamina.value = 19;
    lowStaminaFixture.step({ isAttackHeld: true, isAttackPressed: true });
    for (let index = 0; index < STRIKE_STEP_COUNT - 1; index++) lowStaminaFixture.step(heldInput);

    expect(lowStaminaFixture.step(heldInput)).toBeUndefined();
    expect(lowStaminaFixture.stamina.value).toBe(19);
  });

  test("starts a charged attack variant in place of the charged attack while its check holds", () => {
    expect.hasAssertions();

    const variant: KitAction = { ...TRAVELER_KIT.chargedAttack };
    const kit: Kit = { ...TRAVELER_KIT, chargedAttackVariant: { action: variant, checkIsActive: () => true } };
    const { step } = createFixture(kit);
    const heldInput = { isAttackHeld: true };

    step({ isAttackHeld: true, isAttackPressed: true });
    for (let index = 0; index < STRIKE_STEP_COUNT - 1; index++) step(heldInput);

    expect(step(heldInput)).toBe(variant);
  });

  test("keeps the charged attack while a charged attack variant's check fails", () => {
    expect.hasAssertions();

    const kit: Kit = {
      ...TRAVELER_KIT,
      chargedAttackVariant: { action: { ...TRAVELER_KIT.chargedAttack }, checkIsActive: () => false },
    };
    const { step } = createFixture(kit);
    const heldInput = { isAttackHeld: true };

    step({ isAttackHeld: true, isAttackPressed: true });
    for (let index = 0; index < STRIKE_STEP_COUNT - 1; index++) step(heldInput);

    expect(step(heldInput)).toBe(TRAVELER_KIT.chargedAttack);
  });

  test("a charged attack costing none needs some stamina in the pool, so none starts it on an empty pool", () => {
    expect.hasAssertions();

    const kit: Kit = { ...TRAVELER_KIT, getChargedAttackStaminaMultiplier: () => 0 };
    const kitState = createKitState();
    const partyMember = createPartyMember();
    const stamina = createStamina(STAMINA_MAX);
    stamina.value = 0;
    const context = createKitTestContext(TRAVELER_COMBATANT);
    const step = (input: Partial<KitInput>) =>
      stepKit(kitState, kit, { ...IDLE_INPUT, ...input }, partyMember, stamina, STEP_SECONDS, [], context);
    step({ isAttackHeld: true, isAttackPressed: true });
    for (let index = 0; index < STRIKE_STEP_COUNT - 1; index++) step({ isAttackHeld: true });

    expect(step({ isAttackHeld: true })).toBeUndefined();
    expect(stamina.value).toBe(0);
  });

  test("a charged attack costing none starts on a pool that holds some stamina, and spends none of it", () => {
    expect.hasAssertions();

    const kit: Kit = { ...TRAVELER_KIT, getChargedAttackStaminaMultiplier: () => 0 };
    const kitState = createKitState();
    const partyMember = createPartyMember();
    const stamina = createStamina(STAMINA_MAX);
    stamina.value = 1;
    const context = createKitTestContext(TRAVELER_COMBATANT);
    const step = (input: Partial<KitInput>) =>
      stepKit(kitState, kit, { ...IDLE_INPUT, ...input }, partyMember, stamina, STEP_SECONDS, [], context);
    step({ isAttackHeld: true, isAttackPressed: true });
    for (let index = 0; index < STRIKE_STEP_COUNT - 1; index++) step({ isAttackHeld: true });

    expect(step({ isAttackHeld: true })).toBe(kit.chargedAttack);
    expect(stamina.value).toBe(1);
  });

  test("starts a skill only off its cooldown", () => {
    expect.hasAssertions();

    const { partyMember, step } = createFixture();

    expect(step({ isSkillPressed: true })).toBe(TRAVELER_KIT.elementalSkill);
    expect(partyMember.skillCooldownSeconds).toBe(TRAVELER_KIT.skillCooldownSeconds);

    for (let index = 0; index < 11; index++) step();

    expect(step({ isSkillPressed: true })).toBeUndefined();
  });

  test("a press that ends the state plays none of the skill's hits, and sets no cooldown", () => {
    expect.hasAssertions();

    const kit: Kit = {
      ...TRAVELER_KIT,
      elementalSkill: { ...TRAVELER_KIT.elementalSkill, checkIsStateEndingPress: () => true },
    };
    const { landedHits, partyMember, step } = createFixture(kit);
    const landed: KitHit[] = [];

    step({ isSkillPressed: true });
    landed.push(...landedHits);
    for (let index = 0; index < Math.ceil(kit.elementalSkill.seconds / STEP_SECONDS); index++) {
      step();
      landed.push(...landedHits);
    }

    expect(landed).toStrictEqual([]);
    expect(partyMember.skillCooldownSeconds).toBe(0);
  });

  test("a press that ends the state starts the skill off its cooldown, which it leaves as it was", () => {
    expect.hasAssertions();

    const kit: Kit = {
      ...TRAVELER_KIT,
      elementalSkill: { ...TRAVELER_KIT.elementalSkill, checkIsStateEndingPress: () => true },
    };
    const { partyMember, step } = createFixture(kit);
    partyMember.skillCooldownSeconds = TRAVELER_KIT.skillCooldownSeconds;

    expect(step({ isSkillPressed: true })?.hits).toStrictEqual([]);
    expect(partyMember.skillCooldownSeconds).toBe(TRAVELER_KIT.skillCooldownSeconds);
  });

  test("starts a skill whose cooldown its kit waives while the cooldown runs", () => {
    expect.hasAssertions();

    const { partyMember, step } = createFixture({ ...TRAVELER_KIT, isSkillCooldownWaived: () => true });
    partyMember.skillCooldownSeconds = 5;

    expect(step({ isSkillPressed: true })).toBe(TRAVELER_KIT.elementalSkill);
  });

  test("keeps a skill's cooldown while its kit does not waive it", () => {
    expect.hasAssertions();

    const { partyMember, step } = createFixture();
    partyMember.skillCooldownSeconds = 5;

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
      createKitTestContext({ ...TRAVELER_COMBATANT, elementalResonances: [Element.Anemo] }),
    );

    expect(partyMember.skillCooldownSeconds).toBeCloseTo(
      TRAVELER_KIT.skillCooldownSeconds * KIT_COOLDOWN_MULTIPLIER * IMPETUOUS_WINDS_COOLDOWN_MULTIPLIER,
    );
  });

  test("spends a skill's charges a use each, and gives one back on each cooldown in turn", () => {
    expect.hasAssertions();

    const kit: Kit = { ...TRAVELER_KIT, elementalSkillCharges: 2 };
    const partyMember = createPartyMember();
    // A press from a kit at rest, so no action playing holds it back
    const press = () =>
      stepKit(
        createKitState(),
        kit,
        { ...IDLE_INPUT, isSkillPressed: true },
        partyMember,
        createStamina(STAMINA_MAX),
        STEP_SECONDS,
        [],
        createKitTestContext(TRAVELER_COMBATANT),
      );
    const actions = [press(), press(), press()];
    partyMember.skillCooldownSeconds -= kit.skillCooldownSeconds;
    actions.push(press(), press());

    expect(actions).toStrictEqual([kit.elementalSkill, kit.elementalSkill, undefined, kit.elementalSkill, undefined]);
    expect(partyMember.skillCooldownSeconds).toBe(2 * kit.skillCooldownSeconds);
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

  test("refuses a plunge collision whose landing condition fails, striking none", () => {
    expect.hasAssertions();

    const kit: Kit = { ...TRAVELER_KIT, plungeCollision: { ...TRAVELER_KIT.plungeCollision, landsWhen: () => false } };
    const { landedHits, step } = createFixture(kit);
    const landed: KitHit[] = [];
    const plungeInput = { height: 5, locomotionState: LocomotionState.Plunge };

    step(plungeInput);
    landed.push(...landedHits);
    step(plungeInput);
    landed.push(...landedHits);
    step(plungeInput);
    landed.push(...landedHits);

    expect(landed).toStrictEqual([]);
  });

  test("refuses a plunge landing whose start gate fails, starting none", () => {
    expect.hasAssertions();

    const kit: Kit = {
      ...TRAVELER_KIT,
      highPlunge: { ...TRAVELER_KIT.highPlunge, canStart: () => false },
      lowPlunge: { ...TRAVELER_KIT.lowPlunge, canStart: () => false },
    };
    const { step } = createFixture(kit);

    step({ height: 5, locomotionState: LocomotionState.Plunge });

    expect(step({ height: 0, locomotionState: LocomotionState.Idle })).toBeUndefined();
  });

  // A charged attack started with its hold reached and its strike ended, read off the start alone, so no strike's timing decides it
  const startChargedAttack = (kit: Kit, stamina: { value: number }) =>
    startNextKitAction(
      { ...createKitState(), attackHeldSeconds: CHARGED_ATTACK_HOLD_SECONDS },
      kit,
      { ...IDLE_INPUT, isAttackHeld: true },
      createPartyMember(),
      stamina as ReturnType<typeof createStamina>,
      true,
      [],
      createKitTestContext(TRAVELER_COMBATANT),
    );

  test("starts a charged attack whose start gate holds, spending its stamina", () => {
    expect.hasAssertions();

    const kit: Kit = { ...TRAVELER_KIT, chargedAttack: { ...TRAVELER_KIT.chargedAttack, canStart: () => true } };
    const stamina = createStamina(STAMINA_MAX);

    expect(startChargedAttack(kit, stamina)).toBe(kit.chargedAttack);
    expect(stamina.value).toBe(STAMINA_MAX - TRAVELER_KIT.chargedAttackStamina);
  });

  test("refuses a charged attack whose start gate fails, spending no stamina and starting none", () => {
    expect.hasAssertions();

    const kit: Kit = { ...TRAVELER_KIT, chargedAttack: { ...TRAVELER_KIT.chargedAttack, canStart: () => false } };
    const stamina = createStamina(STAMINA_MAX);

    expect(startChargedAttack(kit, stamina)).toBeUndefined();
    expect(stamina.value).toBe(STAMINA_MAX);
  });

  test("refuses a normal attack whose start gate fails, keeping its place in the string", () => {
    expect.hasAssertions();

    const kit: Kit = {
      ...TRAVELER_KIT,
      normalAttacks: TRAVELER_KIT.normalAttacks.map((action) => ({ ...action, canStart: () => false })),
    };
    const kitState = createKitState();
    const started = startNextKitAction(
      kitState,
      kit,
      { ...IDLE_INPUT, isAttackPressed: true },
      createPartyMember(),
      createStamina(STAMINA_MAX),
      false,
      [],
      createKitTestContext(TRAVELER_COMBATANT),
    );

    expect(started).toBeUndefined();
    expect(kitState.comboIndex).toBe(0);
  });

  test("refuses a skill whose start gate fails, setting no cooldown", () => {
    expect.hasAssertions();

    const kit: Kit = { ...TRAVELER_KIT, elementalSkill: { ...TRAVELER_KIT.elementalSkill, canStart: () => false } };
    const { partyMember, step } = createFixture(kit);

    expect(step({ isSkillPressed: true })).toBeUndefined();
    expect(partyMember.skillCooldownSeconds).toBe(0);
  });

  test("refuses a burst whose start gate fails, keeping its energy", () => {
    expect.hasAssertions();

    const kit: Kit = { ...TRAVELER_KIT, elementalBurst: { ...TRAVELER_KIT.elementalBurst, canStart: () => false } };
    const { partyMember, step } = createFixture(kit);

    partyMember.energy = TRAVELER_KIT.burstEnergyCost;

    expect(step({ isBurstPressed: true })).toBeUndefined();
    expect(partyMember.energy).toBe(TRAVELER_KIT.burstEnergyCost);
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

  test("a plunge variant plays in place of the standard plunge while its check holds", () => {
    expect.hasAssertions();
    const variant: KitAction = { ...TRAVELER_KIT.highPlunge };
    const { step } = createFixture({
      ...TRAVELER_KIT,
      plungeVariants: [{ action: variant, checkIsActive: () => true }],
    });

    step({ height: 5, locomotionState: LocomotionState.Plunge });

    expect(step({ height: 0, locomotionState: LocomotionState.Idle })).toBe(variant);
  });

  test("keeps the standard plunge while every plunge variant's check fails", () => {
    expect.hasAssertions();
    const { step } = createFixture({
      ...TRAVELER_KIT,
      plungeVariants: [{ action: { ...TRAVELER_KIT.highPlunge }, checkIsActive: () => false }],
    });

    step({ height: 5, locomotionState: LocomotionState.Plunge });

    expect(step({ height: 0, locomotionState: LocomotionState.Idle })).toBe(TRAVELER_KIT.highPlunge);
  });

  test("plays the first plunge variant whose check holds", () => {
    expect.hasAssertions();
    const second: KitAction = { ...TRAVELER_KIT.lowPlunge };
    const { step } = createFixture({
      ...TRAVELER_KIT,
      plungeVariants: [
        { action: { ...TRAVELER_KIT.highPlunge }, checkIsActive: () => false },
        { action: second, checkIsActive: () => true },
      ],
    });

    step({ height: 2, locomotionState: LocomotionState.Plunge });

    expect(step({ height: 0, locomotionState: LocomotionState.Idle })).toBe(second);
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

  test("plays a normal attack faster by the Normal ATK SPD its character's attributes raise", () => {
    expect.hasAssertions();
    const kitState = createKitState();
    const combatant = {
      ...TRAVELER_COMBATANT,
      attributes: computeCharacterAttributes([{ attribute: Attribute.NormalAttackSpeed, value: 0.2 }]),
    };
    const context = createKitTestContext(combatant);
    const stepWith = (input: KitInput, stepSeconds: number): void => {
      stepKit(kitState, TRAVELER_KIT, input, createPartyMember(), createStamina(STAMINA_MAX), stepSeconds, [], context);
    };

    stepWith({ ...IDLE_INPUT, isAttackPressed: true }, 0);
    stepWith(IDLE_INPUT, 0.1);

    expect(kitState.actionSeconds).toBeCloseTo(0.1 * 1.2);
  });

  test("plays a normal attack faster by a Normal ATK SPD buff its character carries", () => {
    expect.hasAssertions();
    const kitState = createKitState();
    const context = createKitTestContext(TRAVELER_COMBATANT, {
      kitEffectState: {
        effects: [
          {
            amount: 0.2,
            attribute: Attribute.NormalAttackSpeed,
            characterId: TRAVELER_CHARACTER_ID,
            kind: "buff",
            secondsRemaining: 1,
          },
        ],
      },
    });
    const stepWith = (input: KitInput, stepSeconds: number): void => {
      stepKit(kitState, TRAVELER_KIT, input, createPartyMember(), createStamina(STAMINA_MAX), stepSeconds, [], context);
    };

    stepWith({ ...IDLE_INPUT, isAttackPressed: true }, 0);
    stepWith(IDLE_INPUT, 0.1);

    expect(kitState.actionSeconds).toBeCloseTo(0.1 * 1.2);
  });

  test("plays a normal attack faster by the Normal ATK SPD its character's infusion raises", () => {
    expect.hasAssertions();
    const [firstHit] = TRAVELER_KIT.normalAttacks[0]?.hits ?? [];
    const hitmarkSeconds = firstHit?.hitmarkSeconds ?? 0;
    // The hits a strike has landed once the seconds given have passed, under the Normal ATK SPD bonus given
    const landStrike = (normalAttackSpeedBonus: number): KitHit[] => {
      const kitState = createKitState();
      const landedHits: KitHit[] = [];
      const kitEffectState: KitEffectState = {
        effects: [
          {
            characterId: TRAVELER_CHARACTER_ID,
            element: Element.Cryo,
            kind: "infusion",
            normalAttackSpeedBonus,
            secondsRemaining: 1,
          },
        ],
      };
      const step = (isAttackPressed: boolean, stepSeconds: number): void => {
        stepKit(
          kitState,
          TRAVELER_KIT,
          { ...IDLE_INPUT, isAttackPressed },
          createPartyMember(),
          createStamina(STAMINA_MAX),
          stepSeconds,
          landedHits,
          createKitTestContext(TRAVELER_COMBATANT, { kitEffectState }),
        );
      };
      step(true, 0);
      step(false, hitmarkSeconds / 1.04);
      return landedHits;
    };

    expect(landStrike(0)).toStrictEqual([]);
    expect(landStrike(0.08)).toStrictEqual([firstHit]);
  });

  test("plays a normal attack faster by the Normal ATK SPD the kit's own hook adds to its infusion's", () => {
    expect.hasAssertions();
    const [firstHit] = TRAVELER_KIT.normalAttacks[0]?.hits ?? [];
    const hitmarkSeconds = firstHit?.hitmarkSeconds ?? 0;
    // The hits a strike has landed once the seconds given have passed, under the Normal ATK SPD the kit's hook gives
    const landStrike = (normalAttackSpeedBonus: number): KitHit[] => {
      const kit: Kit = { ...TRAVELER_KIT, getNormalAttackSpeedBonus: () => normalAttackSpeedBonus };
      const kitState = createKitState();
      const landedHits: KitHit[] = [];
      const step = (isAttackPressed: boolean, stepSeconds: number): void => {
        stepKit(
          kitState,
          kit,
          { ...IDLE_INPUT, isAttackPressed },
          createPartyMember(),
          createStamina(STAMINA_MAX),
          stepSeconds,
          landedHits,
          createKitTestContext(TRAVELER_COMBATANT),
        );
      };
      step(true, 0);
      step(false, hitmarkSeconds / 1.04);
      return landedHits;
    };

    expect(landStrike(0)).toStrictEqual([]);
    expect(landStrike(0.08)).toStrictEqual([firstHit]);
  });

  test("lands an extra hit the kit's hook gives on a normal attack's hit, after that hit", () => {
    expect.hasAssertions();
    const [firstHit] = TRAVELER_KIT.normalAttacks[0]?.hits ?? [];
    const hitmarkSeconds = firstHit?.hitmarkSeconds ?? 0;
    const extraHit = TRAVELER_KIT.plungeCollision;
    const kit: Kit = {
      ...TRAVELER_KIT,
      getNormalAttackExtraHit: (_context, hit) => (hit === firstHit ? extraHit : undefined),
    };
    const kitState = createKitState();
    const landedHits: KitHit[] = [];
    const step = (isAttackPressed: boolean, stepSeconds: number): void => {
      stepKit(
        kitState,
        kit,
        { ...IDLE_INPUT, isAttackPressed },
        createPartyMember(),
        createStamina(STAMINA_MAX),
        stepSeconds,
        landedHits,
        createKitTestContext(TRAVELER_COMBATANT),
      );
    };

    step(true, 0);
    step(false, hitmarkSeconds);

    expect(landedHits).toStrictEqual([firstHit, extraHit]);
  });

  test("hands the extra-hit hook the normal attack's place in its chain, the first attack's being 0 and the next's 1", () => {
    expect.hasAssertions();
    const chainIndexes: number[] = [];
    const kit: Kit = {
      ...TRAVELER_KIT,
      getNormalAttackExtraHit: (_context, _hit, chainIndex) => {
        chainIndexes.push(chainIndex);
        return undefined;
      },
    };
    const kitState = createKitState();
    const landedHits: KitHit[] = [];
    const step = (isAttackPressed: boolean, stepSeconds: number): void => {
      stepKit(
        kitState,
        kit,
        { ...IDLE_INPUT, isAttackPressed },
        createPartyMember(),
        createStamina(STAMINA_MAX),
        stepSeconds,
        landedHits,
        createKitTestContext(TRAVELER_COMBATANT),
      );
    };
    // Plays a normal attack out, as a press starts it and the steps with no press run it
    const playOutAttack = (): void => {
      step(true, 0);
      for (let index = 0; index < 200 && kitState.action; index++) step(false, 0.05);
    };

    playOutAttack();
    expect([...new Set(chainIndexes)]).toStrictEqual([0]);

    chainIndexes.length = 0;
    playOutAttack();
    expect([...new Set(chainIndexes)]).toStrictEqual([1]);
  });

  test("an action whose length is decided as it runs plays the length its decision gives from the step its seconds reach the decision's", () => {
    expect.hasAssertions();
    const { kitState, step } = createFixture();
    const action: KitAction = {
      ...TRAVELER_KIT.chargedAttack,
      decideLength: { atSeconds: 0.45, decide: () => 1.7 },
      seconds: 0.7,
    };
    startKitAction(kitState, action, [], createKitTestContext(TRAVELER_COMBATANT));
    const stepFor = (stepCount: number) => {
      for (let stepIndex = 0; stepIndex < stepCount; stepIndex++) step();
    };
    stepFor(7);
    expect(kitState.action).toBe(action);
    stepFor(9);
    expect(kitState.action).toBe(action);
    stepFor(2);
    expect(kitState.action).toBeUndefined();
  });
  // Bennett's kit, whose skill has holds, for a hold on it: its character, the kit's skill held for the steps given and then
  // Released. The kit completes its charge after the hold's step given, or before the hold begins when asked to
  const BENNETT_COMBATANT: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: BENNETT_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: BENNETT_KIT,
    level: 90,
  };
  const CHARGED_BENNETT_ACTION = BENNETT_KIT.elementalSkillHolds?.at(-1)?.action;
  const releaseBennettHold = (
    heldSteps: number,
    { completeAt, completeBefore = false }: { completeAt?: number; completeBefore?: boolean } = {},
  ) => {
    const kitState = createKitState();
    const partyMember = createPartyMember();
    const stamina = createStamina(STAMINA_MAX);
    const context = createKitTestContext(BENNETT_COMBATANT);
    if (completeBefore) completeKitSkillCharge(context.kitEffectState, BENNETT_CHARACTER_ID);
    for (let stepIndex = 0; stepIndex < heldSteps; stepIndex++) {
      stepKit(
        kitState,
        BENNETT_KIT,
        { ...IDLE_INPUT, isSkillHeld: true },
        partyMember,
        stamina,
        STEP_SECONDS,
        [],
        context,
      );
      if (stepIndex === completeAt) completeKitSkillCharge(context.kitEffectState, BENNETT_CHARACTER_ID);
    }
    return stepKit(kitState, BENNETT_KIT, IDLE_INPUT, partyMember, stamina, STEP_SECONDS, [], context);
  };

  test("a held skill whose charge a kit completes mid-hold releases at its highest level, however short it was held", () => {
    expect.hasAssertions();

    expect(CHARGED_BENNETT_ACTION).toBeDefined();
    expect(releaseBennettHold(2, { completeAt: 0 })).toBe(CHARGED_BENNETT_ACTION);
  });

  test("a held skill short of its highest level, with no charge completed, releases below it", () => {
    expect.hasAssertions();

    const action = releaseBennettHold(2);
    expect(action).toBeDefined();
    expect(action).not.toBe(CHARGED_BENNETT_ACTION);
  });

  test("a charge completed before its skill is held does not carry into the hold", () => {
    expect.hasAssertions();

    const action = releaseBennettHold(2, { completeBefore: true });
    expect(action).toBeDefined();
    expect(action).not.toBe(CHARGED_BENNETT_ACTION);
  });

  test("starts the kit's dash as the body enters the Dash state, and its jump as it enters Jump", () => {
    expect.hasAssertions();

    const dash: KitAction = { hits: [], seconds: 0.5, targetingArea: STRIKE_TARGETING_AREA };
    const jump: KitAction = { hits: [], seconds: 0.5, targetingArea: STRIKE_TARGETING_AREA };
    const dashFixture = createFixture({ ...TRAVELER_KIT, dash, jump });
    const jumpFixture = createFixture({ ...TRAVELER_KIT, dash, jump });

    expect([
      dashFixture.step(),
      dashFixture.step({ locomotionState: LocomotionState.Dash }),
      jumpFixture.step({ locomotionState: LocomotionState.Jump }),
    ]).toStrictEqual([undefined, dash, jump]);
  });

  test("starts no dash or jump where the kit holds none", () => {
    expect.hasAssertions();

    const { step } = createFixture();

    expect([
      step({ locomotionState: LocomotionState.Dash }),
      step({ locomotionState: LocomotionState.Jump }),
    ]).toStrictEqual([undefined, undefined]);
  });

  // A kit whose skill runs for two steps, so a jump entered on its first step is the one its end starts
  const createSkillJumpFixture = (jump: KitAction) =>
    createFixture({ ...TRAVELER_KIT, elementalSkill: { ...TRAVELER_KIT.elementalSkill, seconds: 0.2 }, jump });

  test("holds a jump entered during a skill that has not run its length, starting none at once", () => {
    expect.hasAssertions();

    const jump: KitAction = { hits: [], seconds: 0.5, targetingArea: STRIKE_TARGETING_AREA };
    const { step } = createSkillJumpFixture(jump);

    step({ isSkillPressed: true });

    expect(step({ locomotionState: LocomotionState.Jump })).toBeUndefined();
  });

  test("starts a jump entered during a skill on the step the skill's length elapses", () => {
    expect.hasAssertions();

    const jump: KitAction = { hits: [], seconds: 0.5, targetingArea: STRIKE_TARGETING_AREA };
    const { step } = createSkillJumpFixture(jump);

    step({ isSkillPressed: true });
    step({ locomotionState: LocomotionState.Jump });

    expect(step({ locomotionState: LocomotionState.Jump })).toBe(jump);
  });

  test("drops a queued jump the body has glided into as the skill ends, as a jump starts only on foot or in a movement state", () => {
    expect.hasAssertions();

    const jump: KitAction = { hits: [], seconds: 0.5, targetingArea: STRIKE_TARGETING_AREA };
    const { step } = createSkillJumpFixture(jump);

    step({ isSkillPressed: true });
    step({ locomotionState: LocomotionState.Jump });

    expect(step({ locomotionState: LocomotionState.Glide })).toBeUndefined();
  });

  test("clears a queued jump its start gate refuses as the skill ends, starting none after", () => {
    expect.hasAssertions();

    let isStartAllowed = false;
    const jump: KitAction = {
      canStart: () => isStartAllowed,
      hits: [],
      seconds: 0.5,
      targetingArea: STRIKE_TARGETING_AREA,
    };
    const { step } = createSkillJumpFixture(jump);

    step({ isSkillPressed: true });
    step({ locomotionState: LocomotionState.Jump });
    const refused = step({ locomotionState: LocomotionState.Jump });
    isStartAllowed = true;

    expect([refused, step({ locomotionState: LocomotionState.Jump })]).toStrictEqual([undefined, undefined]);
  });
});
