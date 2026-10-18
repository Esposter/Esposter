import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitBody } from "#src/models/kit/KitBody";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitStatus } from "#src/models/kit/KitStatus";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { ALHAITHAM_CHARACTER_ID, createAlhaithamKitBehaviour } from "#src/services/kit/characters/alhaithamKit";
import { KUKI_CHARACTER_ID } from "#src/services/kit/characters/kukiKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const ALHAITHAM_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, ALHAITHAM_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
const party = createParty([ALHAITHAM_CHARACTER_ID]);

// The Mirrors a character holds, as the status the kit keeps them in
const readMirrors = (kitEffectState: KitEffectState): number =>
  kitEffectState.effects.find(
    (effect): effect is KitStatus => effect.kind === "status" && effect.id === "alhaitham-mirrors",
  )?.stacks ?? 0;

// The Mirrors a charged attack's first hit makes, as the striker stands on the body
const strikeWithChargedAttack = (combatant: Combatant, body: KitBody): number => {
  const context = createKitTestContext(combatant);
  const hit = takeOne(ALHAITHAM_KIT.chargedAttack.hits);
  hit.onStrike?.(context, { body, combatant, hit }, enemy);
  return readMirrors(context.kitEffectState);
};

// The first hit of the summon the burst casts, which its strikes are dealt by, as the combatant stands
const getBurstHit = (combatant: Combatant): KitHit => {
  const context = createKitTestContext(combatant);
  ALHAITHAM_KIT.elementalBurst.onStart?.(context);
  return takeOne(
    context.kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon")?.hits ?? [],
  );
};

// The hit of a normal attack's first strike, which a Projection Attack triggers from
const getFirstStrikeHit = (): KitHit => takeOne(takeOne(ALHAITHAM_KIT.normalAttacks).hits);

// Ticks the field of a delayed effect, one that makes its Mirrors once its delay has passed
const tickField = (kitEffectState: KitEffectState, delayFrames: number, combatant: Combatant): void => {
  const field = kitEffectState.effects.find(
    (effect): effect is KitField => effect.kind === "field" && Math.round(effect.nextTickSeconds * 60) === delayFrames,
  );
  field?.onTick(createKitTestContext(combatant, { kitEffectState }), 0);
};

describe(createAlhaithamKitBehaviour, () => {
  // The effects an action's start adds to the team's, which its owner holds
  const castAction = (action: KitAction, combatant = createAlhaithamCombatant()): KitEffectState => {
    const context = createKitTestContext(combatant);
    action.onStart?.(context);
    return context.kitEffectState;
  };

  const createAlhaithamCombatant = (ascension = 0, constellationCount = 0): Combatant => ({
    ascension,
    attributes: computeCharacterAttributes([{ attribute: Attribute.ElementalMastery, value: ELEMENTAL_MASTERY }]),
    characterId: ALHAITHAM_CHARACTER_ID,
    constellationCount,
    elementalResonances: [],
    kit: ALHAITHAM_KIT,
    level: 90,
    weaponType: WeaponType.Sword,
  });

  const ELEMENTAL_MASTERY = 1000;
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };

  test("reads his strikes', charged attack's and plunges' multipliers from his proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...ALHAITHAM_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      ...ALHAITHAM_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      ALHAITHAM_KIT.plungeCollision.talentMultiplier,
      takeOne(ALHAITHAM_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(ALHAITHAM_KIT.highPlunge.hits).talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([
      0.495257, 0.507495, 0.341785, 0.341785, 0.667678, 0.838509, 0.55255, 0.55255, 0.639324, 1.278377, 1.596762,
    ]);
  });

  test("the charged attack costs 20 stamina, and his burst costs 70 energy and cools for 18 seconds", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: ALHAITHAM_KIT.burstCooldownSeconds,
      burstEnergyCost: ALHAITHAM_KIT.burstEnergyCost,
      chargedAttackStamina: ALHAITHAM_KIT.chargedAttackStamina,
      skillCooldownSeconds: ALHAITHAM_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: 18,
      burstEnergyCost: 70,
      chargedAttackStamina: 20,
      skillCooldownSeconds: 18,
    });
  });

  test("the tap makes two Mirrors when he holds none, 15 frames after the cast, with the Dendro infusion they carry", () => {
    expect.hasAssertions();
    const combatant = createAlhaithamCombatant();
    const kitEffectState = castAction(ALHAITHAM_KIT.elementalSkill, combatant);
    const before = readMirrors(kitEffectState);
    tickField(kitEffectState, 15, combatant);

    expect({
      after: readMirrors(kitEffectState),
      before,
      infusions: kitEffectState.effects.filter((effect) => effect.kind === "infusion").map(({ element }) => element),
    }).toStrictEqual({ after: 2, before: 0, infusions: ["Grass"] });
  });

  test("the hold is taken from half a second, and it strikes at 28 frames", () => {
    expect.hasAssertions();
    const [hold] = ALHAITHAM_KIT.elementalSkillHolds ?? [];
    expect({
      hitmarkFrames: Math.round(takeOne(hold?.action.hits ?? []).hitmarkSeconds * 60),
      minimumHeldSeconds: hold?.minimumHeldSeconds,
    }).toStrictEqual({ hitmarkFrames: 28, minimumHeldSeconds: 0.5 });
  });

  test("a Projection Attack strikes once per Mirror from its normal attack, then waits 1.6 seconds", () => {
    expect.hasAssertions();
    const combatant = createAlhaithamCombatant();
    const kitEffectState = castAction(ALHAITHAM_KIT.elementalSkill, combatant);
    tickField(kitEffectState, 15, combatant);
    const context = createKitTestContext(combatant, { kitEffectState });
    const hit = getFirstStrikeHit();
    const strike = { body: kitBody, combatant, hit };
    hit.onStrike?.(context, strike, enemy);
    hit.onStrike?.(context, strike, enemy);
    const summons = kitEffectState.effects.filter((effect): effect is KitSummon => effect.kind === "summon");

    expect(summons.map(({ hits }) => hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60)))).toStrictEqual([
      [28, 37],
    ]);
  });

  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();
    const combatant = createAlhaithamCombatant(0, 1);
    const kitEffectState = castAction(ALHAITHAM_KIT.elementalSkill, combatant);
    tickField(kitEffectState, 15, combatant);
    const context = createKitTestContext(combatant, { kitEffectState });
    const partyMember = getPartyMember(context.party, ALHAITHAM_CHARACTER_ID);
    partyMember.skillCooldownSeconds = 5;
    const hit = getFirstStrikeHit();
    hit.onStrike?.(context, { body: kitBody, combatant, hit }, enemy);
    const [projectionHit] = takeOne(
      kitEffectState.effects.filter((effect): effect is KitSummon => effect.kind === "summon"),
    ).hits;
    projectionHit?.onStrike?.(
      context,
      { body: kitBody, combatant, hit: takeOne(takeOne(ALHAITHAM_KIT.normalAttacks).hits) },
      enemy,
    );
    projectionHit?.onStrike?.(
      context,
      { body: kitBody, combatant, hit: takeOne(takeOne(ALHAITHAM_KIT.normalAttacks).hits) },
      enemy,
    );

    expect(partyMember.skillCooldownSeconds).toBeCloseTo(3.8);
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();
    const combatant = createAlhaithamCombatant(0, 0);
    const kitEffectState = castAction(ALHAITHAM_KIT.elementalSkill, combatant);
    tickField(kitEffectState, 15, combatant);
    const context = createKitTestContext(combatant, { kitEffectState });
    const partyMember = getPartyMember(context.party, ALHAITHAM_CHARACTER_ID);
    partyMember.skillCooldownSeconds = 5;
    const hit = getFirstStrikeHit();
    hit.onStrike?.(context, { body: kitBody, combatant, hit }, enemy);
    const [projectionHit] = takeOne(
      kitEffectState.effects.filter((effect): effect is KitSummon => effect.kind === "summon"),
    ).hits;
    projectionHit?.onStrike?.(context, { body: kitBody, combatant, hit: getFirstStrikeHit() }, enemy);

    expect(partyMember.skillCooldownSeconds).toBe(5);
  });

  test("his burst strikes four hits plus two per Mirror, then makes the Mirrors it did not use after 184 frames", () => {
    expect.hasAssertions();
    const combatant = createAlhaithamCombatant();
    const kitEffectState = castAction(ALHAITHAM_KIT.elementalSkill, combatant);
    tickField(kitEffectState, 15, combatant);
    const mirrorsBeforeBurst = readMirrors(kitEffectState);
    ALHAITHAM_KIT.elementalBurst.onStart?.(createKitTestContext(combatant, { kitEffectState }));
    const burstSummon = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect({
      burstHits: burstSummon?.hits.length,
      mirrorsAfterBurst: readMirrors(kitEffectState),
      mirrorsBeforeBurst,
      regenFrames: kitEffectState.effects
        .filter((effect): effect is KitField => effect.kind === "field" && effect.id === "alhaitham-mirror-regen")
        .map(({ nextTickSeconds }) => Math.round(nextTickSeconds * 60)),
    }).toStrictEqual({ burstHits: 8, mirrorsAfterBurst: 0, mirrorsBeforeBurst: 2, regenFrames: [184] });
  });

  test("leaving the field clears his Mirrors and their Dendro infusion", () => {
    expect.hasAssertions();
    const combatant = createAlhaithamCombatant();
    const kitEffectState = castAction(ALHAITHAM_KIT.elementalSkill, combatant);
    tickField(kitEffectState, 15, combatant);
    ALHAITHAM_KIT.onKitEvent?.(
      {
        characterId: KUKI_CHARACTER_ID,
        kind: KitEventKind.CharacterSwapped,
        previousCharacterId: ALHAITHAM_CHARACTER_ID,
      },
      createKitTestContext(combatant, { kitEffectState }),
      combatant,
    );

    expect({
      infusionSeconds: kitEffectState.effects.find((effect) => effect.kind === "infusion")?.secondsRemaining,
      mirrors: readMirrors(kitEffectState),
    }).toStrictEqual({ infusionSeconds: 0, mirrors: 0 });
  });

  test("the Ascension 1 passive, Four-Causal Correction, takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(strikeWithChargedAttack(createAlhaithamCombatant(1), kitBody)).toBe(1);
  });

  test("the Ascension 1 passive, Four-Causal Correction, does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(strikeWithChargedAttack(createAlhaithamCombatant(0), kitBody)).toBe(0);
  });

  test("the Ascension 4 passive, Mysteries Laid Bare, takes effect at its ascension phase", () => {
    expect.hasAssertions();
    const combatant = createAlhaithamCombatant(4);

    expect(
      ALHAITHAM_KIT.getStrikeDamageBonus?.({ body: kitBody, combatant, hit: getBurstHit(combatant) }, enemy, party, []),
    ).toBeGreaterThan(0);
  });

  test("the Ascension 4 passive, Mysteries Laid Bare, does not take effect below its ascension phase", () => {
    expect.hasAssertions();
    const combatant = createAlhaithamCombatant(3);

    expect(
      ALHAITHAM_KIT.getStrikeDamageBonus?.({ body: kitBody, combatant, hit: getBurstHit(combatant) }, enemy, party, []),
    ).toBe(0);
  });
});
