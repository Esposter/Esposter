import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitStepContext } from "#src/models/kit/KitStepContext";
import type { GroundPoint } from "genshin-engine";

import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { BENNETT_CHARACTER_ID } from "#src/services/character/constants";
import { createBennettKit } from "#src/services/kit/characters/bennettKit";
import { createKitState } from "#src/services/kit/createKitState";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { stepKit } from "#src/services/kit/stepKit";
import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { createStamina, LocomotionState, STAMINA_MAX } from "genshin-engine";
import { describe, expect, test } from "vitest";

const BENNETT_KIT = createBennettKit(await readTalentMultipliers([BENNETT_CHARACTER_ID]));

const MAX_HEALTH = 10_000;
const BASE_ATTACK = 200;

const createBennettCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseHealth, value: MAX_HEALTH },
    { attribute: Attribute.BaseAttack, value: BASE_ATTACK },
  ]),
  characterId: BENNETT_CHARACTER_ID,
  elementalResonances: [],
  kit: BENNETT_KIT,
  level: 90,
});

// Passion Overload pressed or held and released by the kit, its party member's cooldown read after the release
const releaseSkill = (
  heldSeconds: number,
  { ascension, body, effects }: { ascension: number; body: GroundPoint; effects: KitEffect[] },
) => {
  const kitState = createKitState();
  const partyMember = createPartyMember();
  const stamina = createStamina(STAMINA_MAX);
  const landedHits: KitHit[] = [];
  const idleInput: KitInput = {
    height: 0,
    isAttackHeld: false,
    isAttackPressed: false,
    isBurstPressed: false,
    isSkillHeld: false,
    isSkillPressed: false,
    locomotionState: LocomotionState.Idle,
  };
  const context: KitStepContext = {
    body: { facing: 0, height: 0, position: body },
    combatant: { ...createBennettCombatant(), ascension },
    effects,
  };
  for (let step = 0; step < Math.round(heldSeconds / 0.1); step++)
    stepKit(kitState, BENNETT_KIT, { ...idleInput, isSkillHeld: true }, partyMember, stamina, 0.1, landedHits, context);
  const action = stepKit(kitState, BENNETT_KIT, idleInput, partyMember, stamina, 0.1, landedHits, context);
  return { action, partyMember };
};
const NO_EFFECT_STATE = { ascension: 0, body: { x: 0, z: 0 }, effects: [] };

describe("bennett kit", () => {
  test("reads each talent multiplier from its proud skill groups, to the wiki's two decimal places", () => {
    expect.hasAssertions();
    const multipliers = [
      ...BENNETT_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...BENNETT_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      BENNETT_KIT.plungeCollision.talentMultiplier,
      takeOne(BENNETT_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(BENNETT_KIT.highPlunge.hits).talentMultiplier,
      takeOne(BENNETT_KIT.elementalSkill.hits).talentMultiplier,
      takeOne(BENNETT_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.4455, 0.4274, 0.5461, 0.5968, 0.719, 0.559, 0.6072, 0.6393, 1.2784, 1.5968, 1.376, 2.328,
    ];
    expect(multipliers).toHaveLength(expectedMultipliers.length);
    for (const [index, expectedMultiplier] of expectedMultipliers.entries())
      expect(multipliers[index]).toBeCloseTo(expectedMultiplier, 2);
  });

  test("its field infuses the character on it from its first tick, and heals one under 70% of its HP from the second", () => {
    expect.hasAssertions();
    const combatant = createBennettCombatant();
    const party = createParty([BENNETT_CHARACTER_ID]);
    const body = { x: 0, z: 0 };
    const effects: KitEffect[] = [];
    BENNETT_KIT.elementalBurst.onStart?.({ body: { facing: 0, height: 0, position: body }, combatant, effects });

    // The first tick, at 34 frames, gives the ATK bonus of 56% of Bennett's base ATK, and no heal
    stepKitEffects(effects, 34 / 60, { activeCombatant: combatant, body, party });
    expect(effects.filter(({ kind }) => kind !== "field")).toStrictEqual([
      {
        amount: 0.56 * BASE_ATTACK,
        attribute: Attribute.Attack,
        characterId: BENNETT_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 126 / 60,
      },
      { characterId: BENNETT_CHARACTER_ID, element: Element.Pyro, kind: "infusion", secondsRemaining: 126 / 60 },
    ]);

    // The second tick, a second on, heals a character at half its HP by 577 plus 6% of Bennett's Max HP
    const partyMember = getPartyMember(party, BENNETT_CHARACTER_ID);
    partyMember.healthShare = 0.5;
    stepKitEffects(effects, 1, { activeCombatant: combatant, body, party });
    expect(partyMember.healthShare).toBeCloseTo(0.5 + (577.3388 + 0.06 * MAX_HEALTH) / MAX_HEALTH, 4);
  });

  test("plays each Charge Level by how long the skill was held, with that level's cooldown", () => {
    expect.hasAssertions();
    const [chargeLevel1, chargeLevel2] = BENNETT_KIT.elementalSkillHolds ?? [];

    const level1 = releaseSkill(0.6, NO_EFFECT_STATE);
    expect(level1.action).toBe(chargeLevel1?.action);
    expect(level1.partyMember.skillCooldownSeconds).toBeCloseTo(7.5, 5);

    const level2 = releaseSkill(1.2, NO_EFFECT_STATE);
    expect(level2.action).toBe(chargeLevel2?.action);
    expect(level2.partyMember.skillCooldownSeconds).toBeCloseTo(10, 5);

    // A tap is the press, on the press's own cooldown
    const press = releaseSkill(0.1, NO_EFFECT_STATE);
    expect(press.action).toBe(BENNETT_KIT.elementalSkill);
    expect(press.partyMember.skillCooldownSeconds).toBeCloseTo(5, 5);
  });

  test("ascension 1 cuts every passion overload's cooldown by 20%, and ascension 4 halves it in fantastic voyage's field", () => {
    expect.hasAssertions();
    const body = { x: 0, z: 0 };
    const field: KitEffect = {
      centre: body,
      characterId: BENNETT_CHARACTER_ID,
      kind: "field",
      nextTickSeconds: 1,
      onTick: () => {},
      radius: 6,
      secondsRemaining: 10,
      tickIndex: 0,
      tickIntervalSeconds: 1,
    };

    expect(releaseSkill(0.1, { ascension: 1, body, effects: [] }).partyMember.skillCooldownSeconds).toBeCloseTo(4, 5);
    expect(releaseSkill(0.1, { ascension: 4, body, effects: [field] }).partyMember.skillCooldownSeconds).toBeCloseTo(
      2,
      5,
    );
    expect(
      releaseSkill(0.1, { ascension: 4, body: { x: 50, z: 0 }, effects: [field] }).partyMember.skillCooldownSeconds,
    ).toBeCloseTo(4, 5);
  });
});
