import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitStance } from "#src/models/kit/KitStance";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { createSkirkKit, SKIRK_CHARACTER_ID } from "#src/services/kit/characters/skirkKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const SKIRK_KIT = createSkirkKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [SKIRK_CHARACTER_ID]));

const findStance = (kitEffectState: KitEffectState): KitStance | undefined =>
  kitEffectState.effects.find((effect): effect is KitStance => effect.kind === "stance");
const findField = (kitEffectState: KitEffectState): KitField | undefined =>
  kitEffectState.effects.find((effect): effect is KitField => effect.kind === "field");

describe(createSkirkKit, () => {
  // The Seven-Phase Flash's state after its press, entered by the field's tick 19 frames on
  const enterSevenPhaseFlash = (combatant = createSkirkCombatant()): KitEffectState => {
    const kitEffectState = castAction(SKIRK_KIT.elementalSkill, combatant);
    findField(kitEffectState)?.onTick(createKitTestContext(combatant, { kitEffectState }), 0);
    return kitEffectState;
  };

  // The effects an action's start adds to the team's, which its owner holds
  const castAction = (action: KitAction, combatant = createSkirkCombatant()): KitEffectState => {
    const context = createKitTestContext(combatant);
    action.onStart?.(context);
    return context.kitEffectState;
  };

  const createSkirkCombatant = (): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
    characterId: SKIRK_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: SKIRK_KIT,
    level: 90,
    weaponType: WeaponType.Sword,
  });

  const MAX_HEALTH = 10_000;

  test("reads the strikes', charged attack's and plunges' multipliers from her proud attack group", () => {
    expect.hasAssertions();
    const multipliers = [
      ...SKIRK_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...SKIRK_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      SKIRK_KIT.plungeCollision.talentMultiplier,
      takeOne(SKIRK_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(SKIRK_KIT.highPlunge.hits).talentMultiplier,
    ];

    expect(multipliers).toStrictEqual([
      0.54524, 0.49794, 0.32422, 0.32422, 0.60802, 0.82904, 0.66822, 0.66822, 0.639324, 1.278377, 1.596762,
    ]);
  });

  test("the charged attack costs 20 stamina, her burst costs no energy and cools for 15 seconds, and her skill cools for 8 after its state", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: SKIRK_KIT.burstCooldownSeconds,
      burstEnergyCost: SKIRK_KIT.burstEnergyCost,
      chargedAttackStamina: SKIRK_KIT.chargedAttackStamina,
      skillCooldownSeconds: Math.round(SKIRK_KIT.skillCooldownSeconds * 1000) / 1000,
    }).toStrictEqual({
      burstCooldownSeconds: 15,
      burstEnergyCost: 0,
      chargedAttackStamina: 20,
      skillCooldownSeconds: 20.883,
    });
  });

  test("seven-phase Flash's press lands no hit and enters its state 19 frames on, through a task", () => {
    expect.hasAssertions();
    const kitEffectState = castAction(SKIRK_KIT.elementalSkill);
    const field = findField(kitEffectState);

    expect({
      hits: SKIRK_KIT.elementalSkill.hits.length,
      nextTickFrames: Math.round((field?.nextTickSeconds ?? 0) * 60),
      stance: findStance(kitEffectState),
    }).toStrictEqual({ hits: 0, nextTickFrames: 19, stance: undefined });
  });

  // Its skill and burst land no hit, so only its strikes and charged attack carry an attack tag
  test("seven-phase Flash's stance lasts 754 frames, with Normal and Charged attack tags", () => {
    expect.hasAssertions();
    const stance = findStance(enterSevenPhaseFlash());

    expect({
      attackTags: {
        chargedAttack: [...new Set(stance?.combatant.kit.chargedAttack.hits.map(({ attackTag }) => attackTag))],
        normalAttacks: [
          ...new Set(stance?.combatant.kit.normalAttacks.flatMap(({ hits }) => hits.map(({ attackTag }) => attackTag))),
        ],
      },
      normalAttacks: stance?.combatant.kit.normalAttacks.length,
      secondsRemaining: Math.round((stance?.secondsRemaining ?? 0) * 1000) / 1000,
      strikeElements: [
        ...new Set(stance?.combatant.kit.normalAttacks.flatMap(({ hits }) => hits.map(({ element }) => element))),
      ],
    }).toStrictEqual({
      attackTags: { chargedAttack: [AttackTag.ChargedAttack], normalAttacks: [AttackTag.NormalAttack] },
      normalAttacks: 5,
      secondsRemaining: 12.567,
      strikeElements: [Element.Cryo],
    });
  });

  test("havoc: Ruin's five slashes and final slash land at 109, 111, 114, 125, 135 and 158 frames", () => {
    expect.hasAssertions();
    expect(SKIRK_KIT.elementalBurst.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))).toStrictEqual([
      109, 111, 114, 125, 135, 158,
    ]);
  });
});
