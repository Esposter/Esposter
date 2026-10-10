import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { CHONGYUN_CHARACTER_ID, TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createChongyunKit } from "#src/services/kit/characters/chongyunKit";
import { createKitEventContext } from "#src/services/kit/createKitEventContext.test";
import { createKitState } from "#src/services/kit/createKitState";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { stepKit } from "#src/services/kit/stepKit";
import { createParty } from "#src/services/party/createParty";
import { createPartyMember } from "#src/services/party/createPartyMember";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { createStamina, LocomotionState, STAMINA_MAX } from "genshin-engine";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const CHONGYUN_KIT = createChongyunKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [CHONGYUN_CHARACTER_ID]));

const createChongyunCombatant = (ascension = 0, constellationCount = 0): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: CHONGYUN_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: CHONGYUN_KIT,
  level: 90,
  weaponType: WeaponType.Claymore,
});

describe(createChongyunKit, () => {
  const kitBody = { facing: 0, height: 0, position: { x: 0, z: 0 } };
  // The effects an action's start adds, as the kit's effects hold them
  const castEffects = (action: KitAction, combatant = createChongyunCombatant()): KitEffect[] => {
    const kitEffectState: KitEffectState = { effects: [] };
    action.onStart?.({ body: kitBody, combatant, kitEffectState });
    return kitEffectState.effects;
  };
  const castField = (combatant = createChongyunCombatant()): KitField | undefined =>
    castEffects(CHONGYUN_KIT.elementalSkill, combatant).find((effect): effect is KitField => effect.kind === "field");
  const travelerCombatant: Combatant = {
    ...createChongyunCombatant(),
    characterId: TRAVELER_CHARACTER_ID,
    weaponType: WeaponType.Sword,
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

  test("the field leaves a catalyst wielder uninfused, and ascension 1 quickens the infused one's normal attacks by 8%", () => {
    expect.hasAssertions();
    const field = castField(createChongyunCombatant(1));
    const catalystEffectState: KitEffectState = { effects: [] };
    const claymoreEffectState: KitEffectState = { effects: [] };
    const party = createParty([CHONGYUN_CHARACTER_ID]);
    field?.onTick({
      activeCombatant: { ...createChongyunCombatant(), weaponType: WeaponType.Catalyst },
      kitEffectState: catalystEffectState,
      party,
      tickIndex: 0,
    });
    field?.onTick({
      activeCombatant: createChongyunCombatant(),
      kitEffectState: claymoreEffectState,
      party,
      tickIndex: 0,
    });

    expect(catalystEffectState.effects).toStrictEqual([]);
    expect(claymoreEffectState.effects).toStrictEqual([
      {
        characterId: CHONGYUN_CHARACTER_ID,
        element: Element.Cryo,
        kind: "infusion",
        normalAttackSpeedBonus: 0.08,
        secondsRemaining: 2,
      },
    ]);
  });

  test("a swap brings the field's infusion on the character that comes on while it stands", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    CHONGYUN_KIT.elementalSkill.onStart?.({ body: kitBody, combatant: createChongyunCombatant(), kitEffectState });
    CHONGYUN_KIT.onKitEvent?.(
      {
        characterId: TRAVELER_CHARACTER_ID,
        kind: KitEventKind.CharacterSwapped,
        previousCharacterId: CHONGYUN_CHARACTER_ID,
      },
      createKitEventContext(createChongyunCombatant(), { activeCombatant: travelerCombatant, kitEffectState }),
    );

    expect(kitEffectState.effects.filter(({ kind }) => kind === "infusion")).toStrictEqual([
      { characterId: TRAVELER_CHARACTER_ID, element: Element.Cryo, kind: "infusion", secondsRemaining: 2 },
    ]);
  });

  test("a press ends the field standing, and from ascension 4 its end strikes the enemy nearest it, cutting Cryo RES", () => {
    expect.hasAssertions();
    const combatant = createChongyunCombatant(4);
    const kitEffectState: KitEffectState = { effects: [] };
    CHONGYUN_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });
    const [field] = kitEffectState.effects;
    CHONGYUN_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });
    const enemy = { ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""), position: { x: 0, z: -5 } };
    if (field)
      CHONGYUN_KIT.onKitEvent?.(
        { effect: field, kind: KitEventKind.EffectExpired },
        createKitEventContext(combatant, { enemyMap: new Map([["", enemy]]), kitEffectState }),
      );
    const blade = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");
    const [bladeHit] = blade?.hits ?? [];

    expect(field?.secondsRemaining).toBe(0);
    expect(blade?.body.position).toStrictEqual({ x: 0, z: -5 });
    expect(bladeHit?.talentMultiplier).toBeCloseTo(1.7204);
    expect(bladeHit?.enemyStatus?.(combatant)?.resistanceReduction).toStrictEqual({ [Element.Cryo]: 0.1 });
  });

  test("one constellation's fourth strike releases three ice blades five frames apart", () => {
    expect.hasAssertions();
    const context = createKitEventContext(createChongyunCombatant(0, 1));
    CHONGYUN_KIT.onKitEvent?.(
      { action: takeOne(CHONGYUN_KIT.normalAttacks, 3), kind: KitEventKind.NormalAttackLanded },
      context,
    );
    const blades = context.kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(
      blades?.hits.map(({ hitmarkSeconds, talentMultiplier }) => [Math.round(hitmarkSeconds * 60), talentMultiplier]),
    ).toStrictEqual([
      [1, 0.5],
      [6, 0.5],
      [11, 0.5],
    ]);
  });

  test("two constellations' field cuts the cooldown of a burst cast inside it by 15%", () => {
    expect.hasAssertions();
    const combatant = createChongyunCombatant(0, 2);
    const kitEffectState: KitEffectState = { effects: [] };
    CHONGYUN_KIT.elementalSkill.onStart?.({ body: kitBody, combatant, kitEffectState });
    const partyMember = { ...createPartyMember(), energy: 40 };
    stepKit(
      createKitState(),
      CHONGYUN_KIT,
      {
        height: 0,
        isAttackHeld: false,
        isAttackPressed: false,
        isBurstPressed: true,
        isSkillHeld: false,
        isSkillPressed: false,
        locomotionState: LocomotionState.Idle,
      },
      partyMember,
      createStamina(STAMINA_MAX),
      0.1,
      [],
      { body: kitBody, combatant, kitEffectState },
    );

    expect(partyMember.burstCooldownSeconds).toBeCloseTo(12 * 0.85);
  });

  test("four constellations give him 1 energy as his hit lands on an enemy with Cryo on it, once in 2 seconds", () => {
    expect.hasAssertions();
    const combatant = createChongyunCombatant(0, 4);
    const context = createKitEventContext(combatant);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    applyElement(enemy.elementalState, Element.Cryo, 1);
    const hitEnemy = (): void =>
      CHONGYUN_KIT.onKitEvent?.(
        {
          attackTag: AttackTag.NormalAttack,
          enemy,
          hit: takeOne(takeOne(CHONGYUN_KIT.normalAttacks).hits),
          isCritical: false,
          isDefeated: false,
          kind: KitEventKind.DamageTaken,
          striker: combatant,
        },
        context,
      );
    hitEnemy();
    hitEnemy();

    expect(getPartyMember(context.party, CHONGYUN_CHARACTER_ID).energy).toBe(1);
  });

  test("six constellations call a fourth blade at 77 frames, dealing 15% more to an enemy with less of its HP left", () => {
    expect.hasAssertions();
    const combatant = createChongyunCombatant(0, 6);
    const fourthBlade = castEffects(CHONGYUN_KIT.elementalBurst, combatant).find(
      (effect): effect is KitSummon => effect.kind === "summon",
    );
    const party = createParty([CHONGYUN_CHARACTER_ID]);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const getDamageBonus = (healthShare: number): number | undefined =>
      CHONGYUN_KIT.getStrikeDamageBonus?.(
        { body: kitBody, combatant, hit: takeOne(CHONGYUN_KIT.elementalBurst.hits) },
        { ...enemy, health: healthShare * enemy.maxHealth },
        party,
      );

    expect(fourthBlade?.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))).toStrictEqual([77]);
    expect([getDamageBonus(1), getDamageBonus(0.5)]).toStrictEqual([0, 0.15]);
  });
});
