import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitDamageTakenEvent } from "#src/models/kit/KitDamageTakenEvent";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitField } from "#src/models/kit/KitField";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createOroronKitBehaviour, ORORON_CHARACTER_ID } from "#src/services/kit/characters/ororonKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const ORORON_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, ORORON_CHARACTER_ID);
const createOroronCombatant = (ascension = 0, constellationCount = 0): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: ORORON_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: ORORON_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

// The effects an action's start adds, as the kit's effects hold them
const castEffects = (action: KitAction, combatant = createOroronCombatant()): KitEffect[] => {
  const kitEffectState: KitEffectState = { effects: [] };
  action.onStart?.(createKitTestContext(combatant, { kitEffectState }));
  return kitEffectState.effects;
};

describe(createOroronKitBehaviour, () => {
  test("reads each talent multiplier from its proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...ORORON_KIT.normalAttacks.map((action) => takeOne(action.hits).talentMultiplier),
      ...ORORON_KIT.chargedAttack.hits.map(({ talentMultiplier }) => talentMultiplier),
      ORORON_KIT.plungeCollision.talentMultiplier,
      takeOne(ORORON_KIT.lowPlunge.hits).talentMultiplier,
      takeOne(ORORON_KIT.highPlunge.hits).talentMultiplier,
      takeOne(ORORON_KIT.elementalSkill.hits).talentMultiplier,
      ...ORORON_KIT.elementalBurst.hits.map(({ talentMultiplier }) => talentMultiplier),
    ];
    const expectedMultipliers = [0.50642, 0.443734, 0.698208, 1.24, 0.568288, 1.136335, 1.419344, 1.976, 1.74384];
    expect(multipliers).toStrictEqual(expectedMultipliers);
  });

  test("the three strikes land 10 frames after their hitmarks, and their animations cancel at 32, 53 and 70 frames", () => {
    expect.hasAssertions();
    expect(
      ORORON_KIT.normalAttacks.map((action) => Math.round(takeOne(action.hits).hitmarkSeconds * 60)),
    ).toStrictEqual([22, 20, 30]);
    expect(ORORON_KIT.normalAttacks.map((action) => Math.round(action.seconds * 60))).toStrictEqual([32, 53, 70]);
  });

  test("the fully charged Aimed Shot lands at 94 frames, after its 85-frame animation", () => {
    expect.hasAssertions();
    expect(ORORON_KIT.chargedAttack.hits.map(({ hitmarkSeconds }) => Math.round(hitmarkSeconds * 60))).toStrictEqual([
      94,
    ]);
    expect(Math.round(ORORON_KIT.chargedAttack.seconds * 60)).toBe(85);
  });

  test("the Spirit Orb's hit lands at 41 frames and its skill cools for 15 seconds", () => {
    expect.hasAssertions();
    expect(Math.round(takeOne(ORORON_KIT.elementalSkill.hits).hitmarkSeconds * 60)).toBe(41);
    expect(ORORON_KIT.skillCooldownSeconds).toBe(15);
  });

  test("the burst costs 60 energy, cools for 15 seconds, and its soundwave field ticks every second for nine", () => {
    expect.hasAssertions();
    const field = castEffects(ORORON_KIT.elementalBurst).find((effect): effect is KitField => effect.kind === "field");

    expect(ORORON_KIT.burstEnergyCost).toBe(60);
    expect(ORORON_KIT.burstCooldownSeconds).toBe(15);
    expect(field?.tickIntervalSeconds).toBe(1);
    expect(field?.nextTickSeconds).toBe(1);
    expect(field?.secondsRemaining).toBe(9);
    expect(field?.radius).toBe(6.5);
  });

  test("constellation 4 ticks the soundwave every 45 frames", () => {
    expect.hasAssertions();
    const field = castEffects(ORORON_KIT.elementalBurst, createOroronCombatant(0, 4)).find(
      (effect): effect is KitField => effect.kind === "field",
    );

    expect(field?.tickIntervalSeconds).toBeCloseTo(0.75);
  });

  test("each soundwave tick is a summon whose hit lands on its tick", () => {
    expect.hasAssertions();
    const field = castEffects(ORORON_KIT.elementalBurst).find((effect): effect is KitField => effect.kind === "field");
    const kitEffectState: KitEffectState = { effects: [] };
    field?.onTick(createKitTestContext(createOroronCombatant(), { kitEffectState }), 0);
    const tickSummon = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(tickSummon?.hits.map(({ hitmarkSeconds }) => hitmarkSeconds)).toStrictEqual([0]);
  });

  test("constellation 2's Electro DMG Bonus starts at 8% with the burst and gains 8% for each enemy struck, up to 32%", () => {
    expect.hasAssertions();
    const combatant = createOroronCombatant(0, 2);
    const context = createKitTestContext(combatant);
    ORORON_KIT.elementalBurst.onStart?.(context);
    const ritualHit = takeOne(ORORON_KIT.elementalBurst.hits);
    const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const amounts = [0, 1, 2, 3].map(() => {
      ritualHit.onStrike?.(context, { body: context.body, combatant, hit: ritualHit }, enemy);
      return context.kitEffectState.effects.find((effect) => effect.kind === "buff")?.amount;
    });

    expect(amounts).toStrictEqual([0.16, 0.24, 0.32, 0.32]);
  });

  test("ascension 4 gives 3 energy to the active character on each Normal Attack after the Spirit Orb's hit, a second apart", () => {
    expect.hasAssertions();
    const combatant = createOroronCombatant(4);
    const context = createKitTestContext(combatant);
    const spiritOrbHit = takeOne(ORORON_KIT.elementalSkill.hits);
    spiritOrbHit.onStrike?.(
      context,
      { body: context.body, combatant, hit: spiritOrbHit },
      createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
    );
    getPartyMember(context.party, ORORON_CHARACTER_ID).energy = 0;
    const normalAttackEvent: KitDamageTakenEvent = {
      attackTag: AttackTag.NormalAttack,
      enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      hit: takeOne(ORORON_KIT.normalAttacks[0]?.hits ?? []),
      isCritical: false,
      isDefeated: false,
      kind: KitEventKind.DamageTaken,
      striker: combatant,
    };
    ORORON_KIT.onKitEvent?.(normalAttackEvent, context, combatant);
    const energyAfterFirst = getPartyMember(context.party, ORORON_CHARACTER_ID).energy;
    ORORON_KIT.onKitEvent?.(normalAttackEvent, context, combatant);

    expect([energyAfterFirst, getPartyMember(context.party, ORORON_CHARACTER_ID).energy]).toStrictEqual([3, 3]);
  });

  test("each soundwave tick lands from where the burst was cast, whatever the body does after", () => {
    expect.hasAssertions();
    const context = createKitTestContext(createOroronCombatant());
    ORORON_KIT.elementalBurst.onStart?.(context);
    const field = context.kitEffectState.effects.find((effect): effect is KitField => effect.kind === "field");
    context.body.position.x = 1;
    field?.onTick(context, 0);
    const tickSummon = context.kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");

    expect(tickSummon?.body.position).toStrictEqual({ x: 0, z: 0 });
  });
});
