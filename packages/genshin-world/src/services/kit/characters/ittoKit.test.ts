import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStatus } from "#src/models/kit/KitStatus";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createIttoKitBehaviour, ITTO_CHARACTER_ID } from "#src/services/kit/characters/ittoKit";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { findKitStance } from "#src/services/kit/effects/findKitStance";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { readCharacterKitRecord } from "#src/services/kit/readCharacterKitRecord.test";
import { toKitSeconds } from "#src/services/kit/toKitSeconds";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const ITTO_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, ITTO_CHARACTER_ID);
const {
  readActions,
  readFrame,
  readRecordParameter,
  record: ittoRecord,
  toParameter,
} = await readCharacterKitRecord(ITTO_CHARACTER_ID);
const ROYAL_DESCENT_SECONDS = toKitSeconds(readFrame("royalDescent"));
const ROYAL_DESCENT_DEFENSE_SHARE = readRecordParameter("royalDescentDefenseShare");
// The Arataki Kesagiri at three stacks, the charged attack Itto's three normal attacks leave him holding
const THREE_STACK_KESAGIRI = takeOne(readActions("kesagiris"), 2);
const createIttoCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: ITTO_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: ITTO_KIT,
  level: 90,
  weaponType: WeaponType.Claymore,
});

// The stacks of Superlative Superstrength Itto holds among the team's effects
const readSuperstrengthStacks = ({ effects }: KitEffectState): number | undefined =>
  effects.find(
    (effect): effect is KitStatus => effect.kind === "status" && effect.id === "itto-superlative-superstrength",
  )?.stacks;

// Lands each of Itto's four strikes once
const landNormalAttacks = (context: KitContext): void => {
  for (const action of ITTO_KIT.normalAttacks)
    ITTO_KIT.onKitEvent?.({ action, kind: KitEventKind.NormalAttackLanded }, context, context.activeCombatant);
};

describe(createIttoKitBehaviour, () => {
  test("the burst, Royal Descent, adds its ATK per DEF and a Geo conversion with the burst's Normal ATK SPD, ending on a swap", () => {
    expect.hasAssertions();
    const combatant = createIttoCombatant();
    const context = createKitTestContext(combatant);

    ITTO_KIT.elementalBurst.onStart?.(context);

    expect(context.kitEffectState.effects).toStrictEqual([
      {
        amount: ROYAL_DESCENT_DEFENSE_SHARE * combatant.attributes.defense,
        attribute: Attribute.Attack,
        characterId: ITTO_CHARACTER_ID,
        isEndedOnSwap: true,
        kind: "buff",
        secondsRemaining: ROYAL_DESCENT_SECONDS,
      },
      {
        characterId: ITTO_CHARACTER_ID,
        element: Element.Geo,
        isConverted: true,
        isEndedOnSwap: true,
        kind: "infusion",
        normalAttackSpeedBonus: 0.1,
        secondsRemaining: ROYAL_DESCENT_SECONDS,
      },
    ]);
  });

  test("the burst's ATK per DEF reads Itto's DEF as buffed at the cast", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createIttoCombatant());
    buffKitMember(context.kitEffectState, ITTO_CHARACTER_ID, {
      amount: 100,
      attribute: Attribute.Defense,
      secondsRemaining: 1,
    });

    ITTO_KIT.elementalBurst.onStart?.(context);

    expect(context.kitEffectState.effects).toStrictEqual([
      { amount: 100, attribute: Attribute.Defense, characterId: ITTO_CHARACTER_ID, kind: "buff", secondsRemaining: 1 },
      {
        amount: ROYAL_DESCENT_DEFENSE_SHARE * 100,
        attribute: Attribute.Attack,
        characterId: ITTO_CHARACTER_ID,
        isEndedOnSwap: true,
        kind: "buff",
        secondsRemaining: ROYAL_DESCENT_SECONDS,
      },
      {
        characterId: ITTO_CHARACTER_ID,
        element: Element.Geo,
        isConverted: true,
        isEndedOnSwap: true,
        kind: "infusion",
        normalAttackSpeedBonus: 0.1,
        secondsRemaining: ROYAL_DESCENT_SECONDS,
      },
    ]);
  });

  test("constellation 1's Royal Descent gives two Superlative Superstrength stacks at 1.25 seconds, then one every half second from 2.25", () => {
    expect.hasAssertions();
    const context = createKitTestContext({ ...createIttoCombatant(), constellationCount: 1 });

    ITTO_KIT.elementalBurst.onStart?.(context);

    const stacksAfterEachStep = [1.25, 0.75, 0.25, 0.5, 0.5].map((seconds) => {
      stepKitSeconds(context, seconds);
      return readSuperstrengthStacks(context.kitEffectState);
    });
    expect(stacksAfterEachStep).toStrictEqual([2, 2, 3, 4, 5]);
  });

  test("his strikes give Superlative Superstrength as they land, the first and third too as the Raging Oni King", () => {
    expect.hasAssertions();
    const combatant = createIttoCombatant();
    const context = createKitTestContext(combatant);
    landNormalAttacks(context);

    expect(readSuperstrengthStacks(context.kitEffectState)).toBe(3);

    const burstContext = createKitTestContext(combatant);
    ITTO_KIT.elementalBurst.onStart?.(burstContext);
    landNormalAttacks(burstContext);

    expect(readSuperstrengthStacks(burstContext.kitEffectState)).toBe(5);
  });

  test("his stacks turn the charged attack into the Arataki Kesagiri, one slash a stack at no stamina, spent as it starts", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createIttoCombatant());
    const { kitEffectState } = context;
    landNormalAttacks(context);
    const { chargedAttack, chargedAttackStamina } =
      findKitStance(kitEffectState.effects, ITTO_CHARACTER_ID)?.combatant.kit ?? ITTO_KIT;

    expect(chargedAttackStamina).toBe(0);
    expect(chargedAttack.hits.map(({ hitmarkSeconds }) => hitmarkSeconds)).toStrictEqual(
      THREE_STACK_KESAGIRI.hits.map(({ hitmarkFrames }) => toKitSeconds(hitmarkFrames)),
    );
    expect(chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier)).toStrictEqual([0.9116, 0.9116, 1.9092]);

    chargedAttack.onStart?.(context);

    expect(readSuperstrengthStacks(kitEffectState)).toBeUndefined();
    expect(kitEffectState.effects.map(({ kind, secondsRemaining }) => ({ kind, secondsRemaining }))).toStrictEqual([
      { kind: "stance", secondsRemaining: chargedAttack.seconds },
    ]);
    expect(chargedAttack.seconds).toBe(toKitSeconds(THREE_STACK_KESAGIRI.animationFrames));
  });

  test("the skill's Ushi holds Itto's Max HP for its seconds, and gives a stack the first time its hit strikes and another as it leaves", () => {
    expect.hasAssertions();
    const combatant = createIttoCombatant();
    const context = createKitTestContext(combatant);
    const { kitEffectState } = context;
    ITTO_KIT.elementalSkill.onStart?.(context);
    const [ushi] = kitEffectState.effects;

    expect(ushi?.kind === "taunt" && [ushi.health, ushi.secondsRemaining]).toStrictEqual([
      combatant.attributes.maxHealth,
      toKitSeconds(takeOne(ittoRecord.skill.hits).hitmarkFrames) + readRecordParameter("ushiSeconds"),
    ]);

    const hit = takeOne(ITTO_KIT.elementalSkill.hits);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    for (let index = 0; index < 2; index++) hit.onStrike?.(context, { body: context.body, combatant, hit }, enemy);

    expect(readSuperstrengthStacks(kitEffectState)).toBe(1);

    if (ushi) ITTO_KIT.onKitEvent?.({ effect: ushi, kind: KitEventKind.EffectExpired }, context, combatant);

    expect(readSuperstrengthStacks(kitEffectState)).toBe(2);
  });

  test("the skill's Ushi gives a stack as it takes an enemy's strike, at most once in 2 seconds", () => {
    expect.hasAssertions();
    const combatant = createIttoCombatant();
    const context = createKitTestContext(combatant);
    const { kitEffectState } = context;
    ITTO_KIT.elementalSkill.onStart?.(context);
    const ushi = takeOne(kitEffectState.effects);
    assert(ushi.kind === "taunt");
    for (let index = 0; index < 2; index++)
      ITTO_KIT.onKitEvent?.({ damage: 1, kind: KitEventKind.TauntDamaged, taunt: ushi }, context, combatant);

    expect(readSuperstrengthStacks(kitEffectState)).toBe(1);
    expect(
      kitEffectState.effects.flatMap((effect) =>
        effect.kind === "status" && effect.id === "itto-ushi-damaged-cooldown" ? [effect.secondsRemaining] : [],
      ),
    ).toStrictEqual([2]);
  });

  test("the strikes, the Saichimonji Slash, the plunges and Masatsu Zetsugi read their table indexes at talent level 1", () => {
    expect.hasAssertions();
    const talentMultipliers = ITTO_KIT.normalAttacks.map(({ hits }) => hits[0]?.talentMultiplier);

    expect(talentMultipliers).toStrictEqual([0.792318, 0.76368, 0.916416, 1.172249]);
    expect(ITTO_KIT.chargedAttack.hits[0]?.talentMultiplier).toBe(0.90472);
    expect(ITTO_KIT.chargedAttackStamina).toBe(toParameter(ittoRecord.chargedAttackStamina));
    expect(ITTO_KIT.plungeCollision.talentMultiplier).toBe(0.818335);
    expect(ITTO_KIT.lowPlunge.hits[0]?.talentMultiplier).toBe(1.636323);
    expect(ITTO_KIT.highPlunge.hits[0]?.talentMultiplier).toBe(2.043855);
    expect(ITTO_KIT.elementalSkill.hits[0]?.talentMultiplier).toBe(3.072);
  });

  test("the skill and burst read their cooldowns and the burst its energy cost from the proud skill groups", () => {
    expect.hasAssertions();

    expect({
      burstCooldownSeconds: ITTO_KIT.burstCooldownSeconds,
      burstEnergyCost: ITTO_KIT.burstEnergyCost,
      skillCooldownSeconds: ITTO_KIT.skillCooldownSeconds,
    }).toStrictEqual({
      burstCooldownSeconds: toParameter(ittoRecord.burstCooldownSeconds),
      burstEnergyCost: toParameter(ittoRecord.burstEnergyCost),
      skillCooldownSeconds: toParameter(ittoRecord.skillCooldownSeconds),
    });
  });
});

// The DEF share each hit of the Arataki Kesagiri Itto holds the stacks for adds, as he strikes, at the given DEF
const readKesagiriDamageBonuses = (ascension: number): { bonuses: number[]; defense: number } => {
  const combatant = {
    ...createIttoCombatant(),
    ascension,
    attributes: computeCharacterAttributes([
      { attribute: Attribute.BaseHealth, value: 10_000 },
      { attribute: Attribute.BaseDefense, value: 800 },
    ]),
  };
  const context = createKitTestContext(combatant);
  landNormalAttacks(context);
  const { chargedAttack } = findKitStance(context.kitEffectState.effects, ITTO_CHARACTER_ID)?.combatant.kit ?? ITTO_KIT;
  return {
    bonuses: chargedAttack.hits.map((hit) => hit.additiveBaseDamageBonus?.(combatant) ?? 0),
    defense: combatant.attributes.defense,
  };
};

describe("bloodline of the Crimson Oni", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();
    const { bonuses, defense } = readKesagiriDamageBonuses(4);

    expect(bonuses).toStrictEqual(bonuses.map(() => 0.35 * defense));
    expect(defense).toBeGreaterThan(0);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(readKesagiriDamageBonuses(3).bonuses).toStrictEqual([0, 0, 0]);
  });
});
