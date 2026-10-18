import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitStance } from "#src/models/kit/KitStance";

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
import { createCynoKitBehaviour, CYNO_CHARACTER_ID } from "#src/services/kit/characters/cynoKit";
import { castKitAction, createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const CYNO_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, CYNO_CHARACTER_ID);
const findStance = (kitEffectState: KitEffectState): KitStance | undefined =>
  kitEffectState.effects.find((effect): effect is KitStance => effect.kind === "stance");
const findField = (kitEffectState: KitEffectState): KitField | undefined =>
  kitEffectState.effects.find((effect): effect is KitField => effect.kind === "field");
const roundToThousandth = (value: number): number => Math.round(value * 1000) / 1000;

describe(createCynoKitBehaviour, () => {
  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();
    const combatant = createCynoCombatant({ constellationCount: 1 });
    const kitEffectState = castKitAction(CYNO_KIT.elementalBurst, combatant);

    expect(CYNO_KIT.getNormalAttackSpeedBonus?.(createKitTestContext(combatant, { kitEffectState }))).toBe(0.2);
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();
    const combatant = createCynoCombatant({ constellationCount: 0 });
    const kitEffectState = castKitAction(CYNO_KIT.elementalBurst, combatant);

    expect(CYNO_KIT.getNormalAttackSpeedBonus?.(createKitTestContext(combatant, { kitEffectState }))).toBe(0);
  });

  // The effects an action's start adds to the team's, which its owner holds
  const castAction = (action: KitAction, combatant = createCynoCombatant()): KitEffectState => {
    const context = createKitTestContext(combatant);
    action.onStart?.(context);
    return context.kitEffectState;
  };

  const createCynoCombatant = (overrides: Partial<Combatant> = {}): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([
      { attribute: Attribute.BaseHealth, value: MAX_HEALTH },
      { attribute: Attribute.ElementalMastery, value: ELEMENTAL_MASTERY },
    ]),
    characterId: CYNO_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: CYNO_KIT,
    level: 90,
    weaponType: WeaponType.Polearm,
    ...overrides,
  });

  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const MAX_HEALTH = 10_000;
  const ELEMENTAL_MASTERY = 200;

  test("reads the strikes', charged attack's and plunges' multipliers from his proud skill group", () => {
    expect.hasAssertions();
    const multipliers = [
      ...CYNO_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...CYNO_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      CYNO_KIT.plungeCollision.talentMultiplier,
      takeOne(CYNO_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(CYNO_KIT.highPlunge.hits).talentMultiplier,
    ];

    expect(multipliers).toStrictEqual([
      0.492574, 0.479209, 0.293062, 0.293062, 0.758907, 1.22378, 0.639324, 1.278377, 1.596762,
    ]);
  });

  test("the charged attack costs 25 stamina, the skill cools for 7.5 seconds, and the burst costs 80 energy and cools for 20", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: CYNO_KIT.burstCooldownSeconds,
      burstEnergyCost: CYNO_KIT.burstEnergyCost,
      chargedAttackStamina: CYNO_KIT.chargedAttackStamina,
      skillCooldownSeconds: CYNO_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 20,
      burstEnergyCost: 80,
      chargedAttackStamina: 25,
      skillCooldownSeconds: 7.5,
    });
  });

  test("sacred Rite: Wolf's Swiftness sets Pactsworn Pathclearer on the team for its ten seconds and 112 frames, with Elemental Mastery", () => {
    expect.hasAssertions();
    const kitEffectState = castAction(CYNO_KIT.elementalBurst);
    const buff = kitEffectState.effects.find((effect) => effect.kind === "buff");

    expect({
      normalAttacks: findStance(kitEffectState)?.combatant.kit.normalAttacks.length,
      secondsRemaining: Math.round((findStance(kitEffectState)?.secondsRemaining ?? 0) * 1000) / 1000,
      statAmount: buff?.kind === "buff" ? buff.amount : undefined,
      statAttribute: buff?.kind === "buff" ? buff.attribute : undefined,
    }).toStrictEqual({
      normalAttacks: 5,
      secondsRemaining: roundToThousandth(10 + 112 / 60),
      statAmount: 100,
      statAttribute: Attribute.ElementalMastery,
    });
  });

  test("mortuary Rite extends the burst by four seconds, twice at most, and its cooldown is three seconds in the stance", () => {
    expect.hasAssertions();
    const combatant = createCynoCombatant();
    const kitEffectState = castAction(CYNO_KIT.elementalBurst, combatant);
    const stanceSeconds = findStance(kitEffectState)?.secondsRemaining ?? 0;
    const mortuaryRite = findStance(kitEffectState)?.combatant.kit.elementalSkill;
    const context = createKitTestContext(combatant, { kitEffectState });
    for (let cast = 0; cast < 3; cast++) mortuaryRite?.onStart?.(context);

    expect({
      cooldownMultiplier: CYNO_KIT.getSkillCooldownMultiplier?.(context),
      extensionSeconds: roundToThousandth((findStance(kitEffectState)?.secondsRemaining ?? 0) - stanceSeconds),
    }).toStrictEqual({ cooldownMultiplier: 0.4, extensionSeconds: 8 });
  });

  test("the skill's cooldown is unchanged outside the stance", () => {
    expect.hasAssertions();
    const combatant = createCynoCombatant();

    expect(CYNO_KIT.getSkillCooldownMultiplier?.(createKitTestContext(combatant))).toBe(1);
  });

  test("judication's Endseer lands on the first tick at 328 frames, and only while the stance holds", () => {
    expect.hasAssertions();
    const combatant = createCynoCombatant({ ascension: 1 });
    const kitEffectState = castAction(CYNO_KIT.elementalBurst, combatant);
    const field = findField(kitEffectState);
    field?.onTick(createKitTestContext(combatant, { kitEffectState }), 0);

    expect({
      endseer: kitEffectState.effects.some((effect) => effect.kind === "status" && effect.id === "cyno-endseer"),
      nextTickFrames: Math.round((field?.nextTickSeconds ?? 0) * 60),
    }).toStrictEqual({ endseer: true, nextTickFrames: 328 });
  });

  test("the Ascension 1 passive, Featherfall Judgment, takes effect at its ascension phase", () => {
    expect.hasAssertions();
    expect(findField(castAction(CYNO_KIT.elementalBurst, createCynoCombatant({ ascension: 1 })))?.id).toBe(
      "cyno-judication",
    );
  });

  test("the Ascension 1 passive, Featherfall Judgment, does not take effect below its ascension phase", () => {
    expect.hasAssertions();
    expect(findField(castAction(CYNO_KIT.elementalBurst, createCynoCombatant({ ascension: 0 })))).toBeUndefined();
  });

  test("the Ascension 4 passive, Authority Over the Nine Bows, takes effect at its ascension phase", () => {
    expect.hasAssertions();
    const stance = findStance(castAction(CYNO_KIT.elementalBurst, createCynoCombatant({ ascension: 4 })));
    const hit = takeOne(takeOne(stance?.combatant.kit.normalAttacks ?? []).hits);

    expect(hit.additiveBaseDamageBonus?.(createCynoCombatant({ ascension: 4 }))).toBe(ELEMENTAL_MASTERY * 1.5);
  });

  test("the Ascension 4 passive, Authority Over the Nine Bows, does not take effect below its ascension phase", () => {
    expect.hasAssertions();
    const stance = findStance(castAction(CYNO_KIT.elementalBurst, createCynoCombatant({ ascension: 3 })));
    const hit = takeOne(takeOne(stance?.combatant.kit.normalAttacks ?? []).hits);

    expect(hit.additiveBaseDamageBonus?.(createCynoCombatant({ ascension: 3 }))).toBe(0);
  });

  test("constellation 2 raises Electro DMG by 10% a stack for each normal attack's strike, once every 0.1 seconds", () => {
    expect.hasAssertions();
    const combatant = createCynoCombatant({ constellationCount: 2 });
    const kitEffectState: KitEffectState = { effects: [] };
    const hit = takeOne(takeOne(CYNO_KIT.normalAttacks).hits);
    const context = createKitTestContext(combatant, { kitEffectState });
    hit.onStrike?.(context, { body: context.body, combatant, hit }, enemy);
    hit.onStrike?.(context, { body: context.body, combatant, hit }, enemy);
    const bonus = kitEffectState.effects.find((effect) => effect.kind === "buff");

    expect(
      bonus?.kind === "buff" ? { amount: roundToThousandth(bonus.amount), attribute: bonus.attribute } : undefined,
    ).toStrictEqual({ amount: 0.1, attribute: Attribute.ElectroDamageBonus });
  });

  test("a constellation 4 reaction restores 3 energy to each other member, up to five times a burst", () => {
    expect.hasAssertions();
    const combatant = createCynoCombatant({ constellationCount: 4 });
    const other = createCynoCombatant({ characterId: 10_000_066, constellationCount: 0 });
    const party = createParty([CYNO_CHARACTER_ID, other.characterId]);
    const kitEffectState = castAction(CYNO_KIT.elementalBurst, combatant);
    const reaction = {
      enemy,
      kind: KitEventKind.ReactionTriggered as const,
      reactions: [{ element: Element.Electro, reactionType: ReactionType.Superconduct }],
      striker: combatant,
    };
    const context = createKitTestContext(combatant, {
      characterIdCombatantMap: new Map([
        [CYNO_CHARACTER_ID, combatant],
        [other.characterId, other],
      ]),
      kitEffectState,
      party,
    });
    for (let event = 0; event < 6; event++) CYNO_KIT.onKitEvent?.(reaction, context, combatant);

    expect(party.characterIdMemberMap.get(other.characterId)?.energy).toBe(15);
  });
});
