import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitStance } from "#src/models/kit/KitStance";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createKavehKitBehaviour, KAVEH_CHARACTER_ID } from "#src/services/kit/characters/kavehKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const KAVEH_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, KAVEH_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);

describe(createKavehKitBehaviour, () => {
  // The effects the burst's start adds to the team's, which its owner holds
  const castBurst = (): KitEffectState => {
    const kitEffectState: KitEffectState = { effects: [] };
    KAVEH_KIT.elementalBurst.onStart?.(createKitTestContext(createKavehCombatant(), { kitEffectState }));
    return kitEffectState;
  };

  const createKavehCombatant = (): Combatant => ({
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: MAX_HEALTH }]),
    characterId: KAVEH_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: KAVEH_KIT,
    level: 90,
    weaponType: WeaponType.Claymore,
  });

  const MAX_HEALTH = 10_000;

  test("reads the strikes', charged attack's, plunges', skill's and burst's multipliers from his proud skill groups", () => {
    expect.hasAssertions();
    const multipliers = [
      ...KAVEH_KIT.normalAttacks.flatMap(({ hits }) => hits.map(({ talentMultiplier }) => talentMultiplier)),
      KAVEH_KIT.plungeCollision.talentMultiplier,
      KAVEH_KIT.lowPlunge.hits[0]?.talentMultiplier,
      KAVEH_KIT.highPlunge.hits[0]?.talentMultiplier,
      KAVEH_KIT.elementalSkill.hits[0]?.talentMultiplier,
      KAVEH_KIT.elementalBurst.hits[0]?.talentMultiplier,
    ];
    expect(multipliers).toStrictEqual([0.761857, 0.696385, 0.842611, 1.026883, 0.745878, 1.49144, 1.862889, 2.04, 1.6]);
  });

  test("his burst costs 80 energy and cools for 20 seconds, and his skill cools for 6 seconds", () => {
    expect.hasAssertions();
    expect({
      burstCooldownSeconds: KAVEH_KIT.burstCooldownSeconds,
      burstEnergyCost: KAVEH_KIT.burstEnergyCost,
      skillCooldownSeconds: KAVEH_KIT.skillCooldownSeconds,
    }).toStrictEqual({ burstCooldownSeconds: 20, burstEnergyCost: 80, skillCooldownSeconds: 6 });
  });

  test("painted dome sets a stance of twelve seconds, whose first strike reaches 3.6 metres where his own reaches 2.7", () => {
    expect.hasAssertions();
    const stance = castBurst().effects.find((effect): effect is KitStance => effect.kind === "stance");
    expect({
      burstStanceRadius: stance?.combatant.kit.normalAttacks[0]?.hits[0]?.hitArea.radius,
      normalRadius: KAVEH_KIT.normalAttacks[0]?.hits[0]?.hitArea.radius,
      secondsRemaining: stance?.secondsRemaining,
    }).toStrictEqual({
      burstStanceRadius: expect.closeTo(3.6, 9),
      normalRadius: expect.closeTo(2.7, 9),
      secondsRemaining: 12,
    });
  });

  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();
    const combatant = { ...createKavehCombatant(), constellationCount: 2 };
    const kitEffectState: KitEffectState = { effects: [] };
    KAVEH_KIT.elementalBurst.onStart?.(createKitTestContext(combatant, { kitEffectState }));

    expect(KAVEH_KIT.getNormalAttackSpeedBonus?.(createKitTestContext(combatant, { kitEffectState }))).toBe(0.15);
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();
    const combatant = { ...createKavehCombatant(), constellationCount: 1 };
    const kitEffectState: KitEffectState = { effects: [] };
    KAVEH_KIT.elementalBurst.onStart?.(createKitTestContext(combatant, { kitEffectState }));

    expect(KAVEH_KIT.getNormalAttackSpeedBonus?.(createKitTestContext(combatant, { kitEffectState }))).toBe(0);
  });

  test("a Constellation 4 Kaveh's Bloom DMG bonus is 60% on the Bloom he makes, and none on another reaction", () => {
    expect.hasAssertions();
    const bloomDamageBonus = (member: Combatant, reactionType: TransformativeReactionType) =>
      KAVEH_KIT.getPartyReactionBonus?.(
        member,
        {
          combatant: member,
          element: Element.Dendro,
          enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
          reactionType,
        },
        createKitTestContext(member),
      )?.damageBonus ?? 0;
    expect([
      bloomDamageBonus({ ...createKavehCombatant(), constellationCount: 3 }, TransformativeReactionType.Bloom),
      bloomDamageBonus({ ...createKavehCombatant(), constellationCount: 4 }, TransformativeReactionType.Bloom),
      bloomDamageBonus({ ...createKavehCombatant(), constellationCount: 4 }, TransformativeReactionType.Overloaded),
    ]).toStrictEqual([0, 0.6, 0]);
  });

  test("a teammate's Bloom takes none of Kaveh's Constellation 4 DMG bonus", () => {
    expect.hasAssertions();
    const kaveh: Combatant = { ...createKavehCombatant(), constellationCount: 4 };
    const teammate: Combatant = { ...createKavehCombatant(), characterId: KAVEH_CHARACTER_ID + 1 };

    expect(
      KAVEH_KIT.getPartyReactionBonus?.(
        kaveh,
        {
          combatant: teammate,
          element: Element.Dendro,
          enemy: createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
          reactionType: TransformativeReactionType.Bloom,
        },
        createKitTestContext(kaveh),
      )?.damageBonus ?? 0,
    ).toBe(0);
  });

  test("a Constellation 1 Kaveh's Artistic Ingenuity gives him 50% Dendro RES and 25% Incoming Healing Bonus for three seconds", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    KAVEH_KIT.elementalSkill.onStart?.(
      createKitTestContext({ ...createKavehCombatant(), constellationCount: 1 }, { kitEffectState }),
    );

    expect(kitEffectState.effects).toStrictEqual([
      {
        amount: 0.5,
        attribute: Attribute.DendroResistance,
        characterId: KAVEH_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 3,
      },
      {
        amount: 0.25,
        attribute: Attribute.IncomingHealingBonus,
        characterId: KAVEH_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 3,
      },
    ]);
  });

  test("a Constellation 0 Kaveh's Artistic Ingenuity gives him no buff", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };
    KAVEH_KIT.elementalSkill.onStart?.(createKitTestContext(createKavehCombatant(), { kitEffectState }));

    expect(kitEffectState.effects).toStrictEqual([]);
  });
});
