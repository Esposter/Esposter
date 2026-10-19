import type { Reaction } from "#src/models/combat/Reaction";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitHit } from "#src/models/kit/KitHit";
import type { KitInput } from "#src/models/kit/KitInput";
import type { KitShield } from "#src/models/kit/KitShield";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createYunjinKitBehaviour, YUNJIN_CHARACTER_ID } from "#src/services/kit/characters/yunjinKit";
import { createKitState } from "#src/services/kit/createKitState";
import { createKitTestContext, readBuffTuples, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { getDeployedStrikeBonuses } from "#src/services/kit/getDeployedStrikeBonuses";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { stepKit } from "#src/services/kit/stepKit";
import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { getDeployedCombatants } from "#src/services/party/getDeployedCombatants";
import { KIT_FRAMES_PER_SECOND } from "#src/services/shared/constants";
import { takeOne } from "@esposter/shared";
import { createStamina, LocomotionState, STAMINA_MAX } from "genshin-engine";
import { describe, expect, test } from "vitest";

const YUNJIN_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, YUNJIN_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createYunjinCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([
    { attribute: Attribute.BaseHealth, value: 10_000 },
    { attribute: Attribute.BaseDefense, value: 800 },
  ]),
  characterId: YUNJIN_CHARACTER_ID,
  constellationCount: 0,
  element: Element.Geo,
  elementalResonances: [],
  kit: YUNJIN_KIT,
  level: 90,
  weaponType: WeaponType.Polearm,
});
const createTeammate = (characterId: number, element?: Element): Combatant => ({
  ...createYunjinCombatant(),
  characterId,
  element,
});

const castStart = (action: KitAction, combatant = createYunjinCombatant()): KitEffectState => {
  const context = createKitTestContext(combatant);
  action.onStart?.(context);
  return context.kitEffectState;
};

// The buffs Yun Jin's own reactions give her, at a constellation count, as her kit reads them
const readReactionBuffs = (constellationCount: number, reactions: Reaction[]) => {
  const combatant = { ...createYunjinCombatant(), constellationCount };
  const kitEffectState: KitEffectState = { effects: [] };
  const context = createKitTestContext(combatant, { kitEffectState });
  YUNJIN_KIT.onKitEvent?.(
    {
      enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      kind: KitEventKind.ReactionTriggered,
      reactions,
      striker: combatant,
    },
    context,
    combatant,
  );

  return readBuffTuples(kitEffectState.effects);
};

const strikeOf = (combatant: Combatant, hit: KitHit, attackTag: AttackTag): KitStrike => ({
  attackTag,
  body: createKitTestContext(combatant).body,
  combatant,
  hit,
});

describe(createYunjinKitBehaviour, () => {
  test("reads each talent multiplier from her proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...YUNJIN_KIT.normalAttacks.flatMap((action) => action.hits.map((hit) => hit.talentMultiplier)),
      takeOne(YUNJIN_KIT.chargedAttack.hits).talentMultiplier,
      YUNJIN_KIT.plungeCollision.talentMultiplier,
      takeOne(YUNJIN_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(YUNJIN_KIT.highPlunge.hits).talentMultiplier,
      takeOne(YUNJIN_KIT.elementalBurst.hits).talentMultiplier,
    ];
    const expectedMultipliers = [
      0.40506, 0.40248, 0.22962, 0.2752, 0.23994, 0.2881, 0.67338, 1.2169, 0.639324, 1.278377, 1.596762, 2.44,
    ];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("opening Flourish's tap and charges scale with her DEF, not her ATK", () => {
    expect.hasAssertions();
    const combatant = createYunjinCombatant();
    const tap = takeOne(YUNJIN_KIT.elementalSkill.hits);
    const [level1, level2] = YUNJIN_KIT.elementalSkillHolds ?? [];

    expect(tap.talentMultiplier).toBe(0);
    expect(tap.additiveBaseDamageBonus?.(combatant)).toBeCloseTo(1.4912 * combatant.attributes.defense);
    expect(takeOne(level1?.action.hits ?? []).additiveBaseDamageBonus?.(combatant)).toBeCloseTo(
      2.6096 * combatant.attributes.defense,
    );
    expect(takeOne(level2?.action.hits ?? []).additiveBaseDamageBonus?.(combatant)).toBeCloseTo(
      3.728 * combatant.attributes.defense,
    );
  });

  test("the skill's hitmarks and hold thresholds, and the cooldowns and costs her table gives", () => {
    expect.hasAssertions();
    const [level1, level2] = YUNJIN_KIT.elementalSkillHolds ?? [];

    expect(Math.round(takeOne(YUNJIN_KIT.elementalSkill.hits).hitmarkSeconds * 60)).toBe(13);
    expect(Math.round(takeOne(level1?.action.hits ?? []).hitmarkSeconds * 60)).toBe(50);
    expect(Math.round(takeOne(level2?.action.hits ?? []).hitmarkSeconds * 60)).toBe(93);
    expect([level1?.minimumHeldSeconds, level2?.minimumHeldSeconds]).toStrictEqual([0.5, 1]);
    expect([YUNJIN_KIT.skillCooldownSeconds, level1?.cooldownSeconds, level2?.cooldownSeconds]).toStrictEqual([
      9, 9, 9,
    ]);
    expect([
      YUNJIN_KIT.chargedAttackStamina,
      YUNJIN_KIT.burstEnergyCost,
      YUNJIN_KIT.burstCooldownSeconds,
    ]).toStrictEqual([25, 60, 15]);
  });

  test("opening Flourish's shield is her Max HP's share and flat HP, lasting until its hit", () => {
    expect.hasAssertions();
    const combatant = createYunjinCombatant();
    const [shield] = castStart(YUNJIN_KIT.elementalSkill, combatant).effects as KitShield[];

    expect(shield?.kind).toBe("shield");
    expect(shield?.element).toBe(Element.Geo);
    expect(shield?.health).toBeCloseTo(0.12 * combatant.attributes.maxHealth + 1155.4323);
    expect(shield?.secondsRemaining).toBeCloseTo(13 / 60);
  });

  test("the burst's initial hit is a circle of 6 metres round the body, with its 200 poise", () => {
    expect.hasAssertions();
    const hit: KitHit = takeOne(YUNJIN_KIT.elementalBurst.hits);

    expect(hit.hitArea.radius).toBe(6);
    expect(hit.poiseDamage).toBe(200);
    expect(Math.round(hit.hitmarkSeconds * 60)).toBe(35);
  });

  test("a Constellation 4 Crystallize of hers gives her 20% DEF for 12 seconds", () => {
    expect.hasAssertions();

    expect(readReactionBuffs(4, [{ element: Element.Geo, reactionType: ReactionType.Crystallize }])).toStrictEqual([
      [Attribute.DefensePercent, 0.2, 12],
    ]);
  });

  test("a Constellation 3 switch, or a reaction that is not Crystallize, gives no DEF", () => {
    expect.hasAssertions();

    expect([
      readReactionBuffs(3, [{ element: Element.Geo, reactionType: ReactionType.Crystallize }]),
      readReactionBuffs(4, [{ element: Element.Electro, reactionType: ReactionType.Superconduct }]),
    ]).toStrictEqual([[], []]);
  });
});

describe("ascension 1's counter window", () => {
  const FRAME_SECONDS = 1 / KIT_FRAMES_PER_SECOND;
  const IDLE_INPUT: KitInput = {
    height: 0,
    isAttackHeld: false,
    isAttackPressed: false,
    isBurstPressed: false,
    isSkillHeld: false,
    isSkillPressed: false,
    locomotionState: LocomotionState.Idle,
  };
  const LEVEL_1_ACTION = YUNJIN_KIT.elementalSkillHolds?.[0]?.action;
  const TOP_LEVEL_ACTION = YUNJIN_KIT.elementalSkillHolds?.at(-1)?.action;
  const ascension1Combatant: Combatant = { ...createYunjinCombatant(), ascension: 1 };

  // A strike on Yun Jin, as the party hears an enemy's hit on her
  const strikeYunjin = (context: KitContext, combatant: Combatant) =>
    YUNJIN_KIT.onKitEvent?.(
      {
        bondOfLifeShare: 0,
        characterId: YUNJIN_CHARACTER_ID,
        healthShare: -0.1,
        isFallRefused: false,
        kind: KitEventKind.HealthChanged,
        overflowHealthShare: 0,
      },
      context,
      combatant,
    );

  // Her skill held for the frames given and let go on the frame after, each frame's effects stepped as the world steps
  // Them, so the window runs out in the time it would; the action the release starts is returned
  const holdAndRelease = (context: KitContext, heldFrames: number): KitAction | undefined => {
    const kitState = createKitState();
    const partyMember = createPartyMember();
    const stamina = createStamina(STAMINA_MAX);
    const stepFrame = (input: KitInput) => {
      stepKitEffects(FRAME_SECONDS, context);
      return stepKit(kitState, YUNJIN_KIT, input, partyMember, stamina, FRAME_SECONDS, [], context);
    };
    for (let frame = 0; frame < heldFrames; frame++) stepFrame({ ...IDLE_INPUT, isSkillHeld: true });
    return stepFrame(IDLE_INPUT);
  };

  test("a strike on her while her skill is held opens the window", () => {
    expect.hasAssertions();
    const context = createKitTestContext(ascension1Combatant, { isSkillHeld: true });

    expect(YUNJIN_KIT.jumpsSkillHoldToTop?.(context)).toBe(false);
    strikeYunjin(context, ascension1Combatant);
    expect(YUNJIN_KIT.jumpsSkillHoldToTop?.(context)).toBe(true);
  });

  test("a release within the window plays the top hold level, however short the hold was", () => {
    expect.hasAssertions();
    const context = createKitTestContext(ascension1Combatant, { isSkillHeld: true });
    strikeYunjin(context, ascension1Combatant);

    expect(holdAndRelease(context, 12)).toBe(TOP_LEVEL_ACTION);
  });

  test("a release after the window closed does not, and plays the level its held seconds reach", () => {
    expect.hasAssertions();
    const context = createKitTestContext(ascension1Combatant, { isSkillHeld: true });
    strikeYunjin(context, ascension1Combatant);

    expect(holdAndRelease(context, 36)).toBe(LEVEL_1_ACTION);
  });

  test("a strike on her outside a hold opens nothing", () => {
    expect.hasAssertions();
    const context = createKitTestContext(ascension1Combatant);
    strikeYunjin(context, ascension1Combatant);

    expect(holdAndRelease(context, 12)).toBe(YUNJIN_KIT.elementalSkill);
  });

  test("a strike on her during a hold opens nothing below Ascension 1", () => {
    expect.hasAssertions();
    const combatant = createYunjinCombatant();
    const context = createKitTestContext(combatant, { isSkillHeld: true });
    strikeYunjin(context, combatant);

    expect(holdAndRelease(context, 12)).toBe(YUNJIN_KIT.elementalSkill);
  });
});

describe("cliffbreaker's Banner's DMG Increase", () => {
  // A teammate of Yun Jin's in the element given, with Yun Jin's kit standing in for its own, which none of
  // These tests reads
  const OTHER_CHARACTER_ID = 1;

  const BURST_HIT_SECONDS = takeOne(YUNJIN_KIT.elementalBurst.hits).hitmarkSeconds;
  const NORMAL_ATTACK_HIT = takeOne(takeOne(YUNJIN_KIT.normalAttacks).hits);
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const party = createParty([YUNJIN_CHARACTER_ID]);
  // The flat base damage a strike of hers adds as it is priced against the enemy, with the effects on the team given,
  // And the team's combatants by id, which default to Yun Jin alone
  const getIncrease = (
    strike: KitStrike,
    kitEffectState: KitEffectState,
    team = party,
    characterIdCombatantMap = new Map([[strike.combatant.characterId, strike.combatant]]),
  ) =>
    YUNJIN_KIT.getStrikeAdditiveBaseDamageBonus?.(strike, enemy, team, kitEffectState.effects, characterIdCombatantMap);
  const teamParty = createParty([YUNJIN_CHARACTER_ID, OTHER_CHARACTER_ID]);
  // The flat base damage a teammate's normal attack adds from the team's party strike hooks, as a strike of the
  // Team takes it
  const getPartyIncrease = (
    teammate: Combatant,
    characterIdCombatantMap: Map<number, Combatant>,
    kitEffectState: KitEffectState,
  ) =>
    getDeployedStrikeBonuses(
      strikeOf(teammate, NORMAL_ATTACK_HIT, AttackTag.NormalAttack),
      getDeployedCombatants(teamParty, characterIdCombatantMap),
      enemy,
      teamParty,
      kitEffectState.effects,
      characterIdCombatantMap,
    ).additiveBaseDamageBonus;

  test("the burst puts the banner up, so a normal attack's hit gains the increase", () => {
    expect.hasAssertions();
    const combatant = createYunjinCombatant();
    const kitEffectState = castStart(YUNJIN_KIT.elementalBurst, combatant);

    expect(getIncrease(strikeOf(combatant, NORMAL_ATTACK_HIT, AttackTag.NormalAttack), kitEffectState)).toBeGreaterThan(
      0,
    );
  });

  test("the increase is the burst's DEF share of her buffed DEF", () => {
    expect.hasAssertions();
    const combatant = createYunjinCombatant();
    const kitEffectState = castStart(YUNJIN_KIT.elementalBurst, combatant);
    buffKitMember(kitEffectState, YUNJIN_CHARACTER_ID, {
      amount: 0.2,
      attribute: Attribute.DefensePercent,
      secondsRemaining: 12,
      source: "yunjin-test-defense",
    });
    const buffedCombatant = getBuffedCombatant(
      combatant,
      kitEffectState.effects,
      party,
      new Map([[YUNJIN_CHARACTER_ID, combatant]]),
    );

    expect(
      getIncrease(strikeOf(buffedCombatant, NORMAL_ATTACK_HIT, AttackTag.NormalAttack), kitEffectState),
    ).toBeCloseTo(0.3216 * 960);
  });

  test("the increase ends twelve seconds after the banner's hit", () => {
    expect.hasAssertions();
    const combatant = createYunjinCombatant();
    const context = createKitTestContext(combatant);
    YUNJIN_KIT.elementalBurst.onStart?.(context);
    const normalAttack = strikeOf(combatant, NORMAL_ATTACK_HIT, AttackTag.NormalAttack);

    stepKitSeconds(context, BURST_HIT_SECONDS + 11);
    expect(getIncrease(normalAttack, context.kitEffectState)).toBeGreaterThan(0);
    stepKitSeconds(context, 1.1);
    expect(getIncrease(normalAttack, context.kitEffectState)).toBe(0);
  });

  test("a charged attack or a skill gets no increase", () => {
    expect.hasAssertions();
    const combatant = createYunjinCombatant();
    const kitEffectState = castStart(YUNJIN_KIT.elementalBurst, combatant);

    expect([
      getIncrease(strikeOf(combatant, takeOne(YUNJIN_KIT.chargedAttack.hits), AttackTag.ChargedAttack), kitEffectState),
      getIncrease(
        strikeOf(combatant, takeOne(YUNJIN_KIT.elementalSkill.hits), AttackTag.ElementalSkill),
        kitEffectState,
      ),
    ]).toStrictEqual([0, 0]);
  });

  test("each enemy her normal attack damages spends one of the banner's 30 stacks", () => {
    expect.hasAssertions();
    const combatant = createYunjinCombatant();
    const context = createKitTestContext(combatant);
    YUNJIN_KIT.elementalBurst.onStart?.(context);
    const normalAttack = strikeOf(combatant, NORMAL_ATTACK_HIT, AttackTag.NormalAttack);
    const damageTaken: KitEvent = {
      attackTag: AttackTag.NormalAttack,
      enemy,
      hit: NORMAL_ATTACK_HIT,
      isCritical: false,
      isDefeated: false,
      kind: KitEventKind.DamageTaken,
      striker: combatant,
    };

    for (let spent = 0; spent < 29; spent++) YUNJIN_KIT.onKitEvent?.(damageTaken, context, combatant);
    expect(getIncrease(normalAttack, context.kitEffectState)).toBeGreaterThan(0);
    YUNJIN_KIT.onKitEvent?.(damageTaken, context, combatant);
    expect(getIncrease(normalAttack, context.kitEffectState)).toBe(0);
  });

  test("a teammate's normal attack takes the banner's increase while it stands", () => {
    expect.hasAssertions();
    const combatant = createYunjinCombatant();
    const teammate = createTeammate(OTHER_CHARACTER_ID);
    const characterIdCombatantMap = new Map([
      [OTHER_CHARACTER_ID, teammate],
      [YUNJIN_CHARACTER_ID, combatant],
    ]);
    const context = createKitTestContext(combatant, { characterIdCombatantMap, party: teamParty });
    YUNJIN_KIT.elementalBurst.onStart?.(context);

    expect(getPartyIncrease(teammate, characterIdCombatantMap, context.kitEffectState)).toBeCloseTo(
      0.3216 * combatant.attributes.defense,
    );
  });

  test("each enemy a teammate's normal attack damages spends one of the banner's 30 stacks", () => {
    expect.hasAssertions();
    const combatant = createYunjinCombatant();
    const teammate = createTeammate(OTHER_CHARACTER_ID);
    const characterIdCombatantMap = new Map([
      [OTHER_CHARACTER_ID, teammate],
      [YUNJIN_CHARACTER_ID, combatant],
    ]);
    const context = createKitTestContext(combatant, { characterIdCombatantMap, party: teamParty });
    YUNJIN_KIT.elementalBurst.onStart?.(context);
    const damageTaken: KitEvent = {
      attackTag: AttackTag.NormalAttack,
      enemy,
      hit: NORMAL_ATTACK_HIT,
      isCritical: false,
      isDefeated: false,
      kind: KitEventKind.DamageTaken,
      striker: teammate,
    };

    for (let spent = 0; spent < 29; spent++) YUNJIN_KIT.onKitEvent?.(damageTaken, context, combatant);
    expect(getPartyIncrease(teammate, characterIdCombatantMap, context.kitEffectState)).toBeGreaterThan(0);
    YUNJIN_KIT.onKitEvent?.(damageTaken, context, combatant);
    expect(getPartyIncrease(teammate, characterIdCombatantMap, context.kitEffectState)).toBe(0);
  });

  test("constellations 1, 2 and 6 give no increase, which stays 0.3216 of her DEF", () => {
    expect.hasAssertions();
    for (const constellationCount of [1, 2, 6]) {
      const combatant = { ...createYunjinCombatant(), constellationCount };
      const kitEffectState = castStart(YUNJIN_KIT.elementalBurst, combatant);

      expect(getIncrease(strikeOf(combatant, NORMAL_ATTACK_HIT, AttackTag.NormalAttack), kitEffectState)).toBeCloseTo(
        0.3216 * combatant.attributes.defense,
      );
    }
  });

  // Yun Jin with the teammates given, each drawn in its element, at the ascension given, with the team's
  // Combatants by id
  const createYunjinTeam = (ascension: number, teammateElements: Element[]) => {
    const combatant: Combatant = { ...createYunjinCombatant(), ascension };
    const teammates = teammateElements.map((element, index) => createTeammate(OTHER_CHARACTER_ID + index, element));
    return {
      characterIdCombatantMap: new Map(
        [combatant, ...teammates].map((member): [number, Combatant] => [member.characterId, member]),
      ),
      combatant,
      party: createParty([YUNJIN_CHARACTER_ID, ...teammates.map(({ characterId }) => characterId)]),
    };
  };
  // The flat base damage a normal attack of Yun Jin's adds while the banner stands, on the team given
  const getTeamIncrease = ({
    characterIdCombatantMap,
    combatant,
    party: createdTeamParty,
  }: ReturnType<typeof createYunjinTeam>) =>
    getIncrease(
      strikeOf(combatant, NORMAL_ATTACK_HIT, AttackTag.NormalAttack),
      castStart(YUNJIN_KIT.elementalBurst, combatant),
      createdTeamParty,
      characterIdCombatantMap,
    );

  test("with one Elemental Type on the team, however many members draw it, Ascension 4 adds 2.5% of her DEF", () => {
    expect.hasAssertions();
    const team = createYunjinTeam(4, [Element.Geo]);

    expect(getTeamIncrease(team)).toBeCloseTo((0.3216 + 0.025) * team.combatant.attributes.defense);
  });

  test("with two Elemental Types on the team, Ascension 4 adds 5% of her DEF", () => {
    expect.hasAssertions();
    const team = createYunjinTeam(4, [Element.Pyro]);

    expect(getTeamIncrease(team)).toBeCloseTo((0.3216 + 0.05) * team.combatant.attributes.defense);
  });

  test("with three Elemental Types on the team, Ascension 4 adds 7.5% of her DEF", () => {
    expect.hasAssertions();
    const team = createYunjinTeam(4, [Element.Pyro, Element.Hydro]);

    expect(getTeamIncrease(team)).toBeCloseTo((0.3216 + 0.075) * team.combatant.attributes.defense);
  });

  test("with four Elemental Types on the team, Ascension 4 adds 11.5% of her DEF to the banner's increase", () => {
    expect.hasAssertions();
    const team = createYunjinTeam(4, [Element.Pyro, Element.Hydro, Element.Electro]);

    expect(getTeamIncrease(team)).toBeCloseTo((0.3216 + 0.115) * team.combatant.attributes.defense);
  });

  test("below Ascension 4, the team's Elemental Types add nothing to the banner's increase", () => {
    expect.hasAssertions();
    const team = createYunjinTeam(3, [Element.Pyro, Element.Hydro, Element.Electro]);

    expect(getTeamIncrease(team)).toBeCloseTo(0.3216 * team.combatant.attributes.defense);
  });
});
