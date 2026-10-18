import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitHit } from "#src/models/kit/KitHit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createYoimiyaKitBehaviour, YOIMIYA_CHARACTER_ID } from "#src/services/kit/characters/yoimiyaKit";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { findKitStance } from "#src/services/kit/effects/findKitStance";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const YOIMIYA_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, YOIMIYA_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createYoimiyaCombatant = (ascension = 0): Combatant => ({
  ascension,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: YOIMIYA_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: YOIMIYA_KIT,
  level: 90,
  weaponType: WeaponType.Bow,
});

// The damage an enemy took from a hit a combatant dealt as a kind of attack, if it was dealt as one
const createDamageTakenEvent = (
  enemy: Enemy,
  hit: KitHit,
  striker: Combatant,
  attackTag?: AttackTag,
  isDefeated = false,
  isCritical = false,
): KitEvent => ({ attackTag, enemy, hit, isCritical, isDefeated, kind: KitEventKind.DamageTaken, striker });

// The attribute, amount and seconds of each buff in a kit's effects
const readBuffTuples = (effects: KitEffectState["effects"]) =>
  effects.flatMap((effect) =>
    effect.kind === "buff" ? [[effect.attribute, effect.amount, effect.secondsRemaining]] : [],
  );

// The buffs a Pyro hit of Yoimiya's that is or is not a CRIT gives her, at a constellation count, as its kit reads them
const readCriticalBuffs = (constellationCount: number, isCritical: boolean) => {
  const combatant = { ...createYoimiyaCombatant(), constellationCount };
  const kitEffectState: KitEffectState = { effects: [] };
  const context = createKitTestContext(combatant, { kitEffectState });
  const enemy = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
  const hit = takeOne(takeOne(YOIMIYA_KIT.normalAttacks).hits);
  YOIMIYA_KIT.onKitEvent?.(
    createDamageTakenEvent(enemy, hit, combatant, AttackTag.NormalAttack, false, isCritical),
    context,
    combatant,
  );

  return readBuffTuples(kitEffectState.effects);
};

describe(createYoimiyaKitBehaviour, () => {
  const OTHER_CHARACTER_ID = 10_000_003;

  test("niwabi Fire-Dance is a stance for the table's seconds whose strikes deal Pyro at the skill's multiplier", () => {
    expect.hasAssertions();
    const kitEffectState: KitEffectState = { effects: [] };

    YOIMIYA_KIT.elementalSkill.onStart?.(createKitTestContext(createYoimiyaCombatant(), { kitEffectState }));
    const { normalAttacks } = findKitStance(kitEffectState.effects, YOIMIYA_CHARACTER_ID)?.combatant.kit ?? YOIMIYA_KIT;

    expect(kitEffectState.effects.map(({ kind, secondsRemaining }) => [kind, secondsRemaining])).toStrictEqual([
      ["stance", 10],
    ]);
    expect(normalAttacks.flatMap(({ hits }) => hits.map(({ element, gauge }) => `${element} ${gauge}`))).toStrictEqual(
      YOIMIYA_KIT.normalAttacks.flatMap(({ hits }) => hits.map(() => `${Element.Pyro} 1`)),
    );
    expect(normalAttacks.map(({ hits }) => takeOne(hits).talentMultiplier)).toStrictEqual(
      YOIMIYA_KIT.normalAttacks.map(({ hits }) => takeOne(hits).talentMultiplier * 1.37909),
    );
  });

  test("the burst marks the first enemy it strikes with Aurous Blaze, which another member's hit sets off once a cooldown", () => {
    expect.hasAssertions();
    const combatant = createYoimiyaCombatant();
    const other: Combatant = { ...combatant, characterId: OTHER_CHARACTER_ID };
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState });
    const marked = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const unmarked = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    const burstHit = takeOne(YOIMIYA_KIT.elementalBurst.hits);
    YOIMIYA_KIT.elementalBurst.onStart?.(context);
    for (const enemy of [marked, unmarked])
      YOIMIYA_KIT.onKitEvent?.(
        createDamageTakenEvent(enemy, burstHit, combatant, AttackTag.ElementalBurst),
        context,
        combatant,
      );

    expect(
      [marked, unmarked].map(({ statuses }) => statuses.map(({ id, secondsRemaining }) => [id, secondsRemaining])),
    ).toStrictEqual([[["yoimiya-aurous-blaze", 10]], []]);

    const strike = takeOne(takeOne(YOIMIYA_KIT.normalAttacks).hits);
    for (const striker of [combatant, other, other])
      YOIMIYA_KIT.onKitEvent?.(
        createDamageTakenEvent(marked, strike, striker, AttackTag.NormalAttack),
        context,
        combatant,
      );
    YOIMIYA_KIT.onKitEvent?.(
      createDamageTakenEvent(unmarked, strike, other, AttackTag.NormalAttack),
      context,
      combatant,
    );

    expect(
      kitEffectState.effects.flatMap((effect) =>
        effect.kind === "summon"
          ? effect.hits.map(({ hitmarkSeconds, talentMultiplier }) => [
              effect.attackTag,
              hitmarkSeconds,
              talentMultiplier,
            ])
          : [],
      ),
    ).toStrictEqual([[AttackTag.ElementalBurst, 1 / 60, 1.22]]);
    expect(marked.statuses.map(({ id, secondsRemaining }) => [id, secondsRemaining])).toStrictEqual([
      ["yoimiya-aurous-blaze", 10],
      ["yoimiya-aurous-blaze-cooldown", 2],
    ]);
  });

  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();
    // Ascension 1: two Blazing Arrows that strike an enemy while Niwabi Fire-Dance stands count two, 2% Pyro DMG Bonus each
    const combatant = createYoimiyaCombatant(1);
    const kitEffectState: KitEffectState = { effects: [] };
    YOIMIYA_KIT.elementalSkill.onStart?.(createKitTestContext(combatant, { kitEffectState }));
    const arrow = createDamageTakenEvent(
      createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      takeOne(YOIMIYA_KIT.normalAttacks[0]?.hits ?? []),
      combatant,
      AttackTag.NormalAttack,
    );
    const context = createKitTestContext(combatant, { kitEffectState });
    YOIMIYA_KIT.onKitEvent?.(arrow, context, combatant);
    YOIMIYA_KIT.onKitEvent?.(arrow, context, combatant);

    expect(kitEffectState.effects.filter((effect) => effect.kind === "buff")).toStrictEqual([
      {
        amount: 0.04,
        attribute: Attribute.PyroDamageBonus,
        characterId: YOIMIYA_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 3,
        source: "yoimiya-a1",
      },
    ]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();
    // Below Ascension 1 the same two Blazing Arrows raise no count
    const combatant = createYoimiyaCombatant(0);
    const kitEffectState: KitEffectState = { effects: [] };
    YOIMIYA_KIT.elementalSkill.onStart?.(createKitTestContext(combatant, { kitEffectState }));
    const arrow = createDamageTakenEvent(
      createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""),
      takeOne(YOIMIYA_KIT.normalAttacks[0]?.hits ?? []),
      combatant,
      AttackTag.NormalAttack,
    );
    const context = createKitTestContext(combatant, { kitEffectState });
    YOIMIYA_KIT.onKitEvent?.(arrow, context, combatant);
    YOIMIYA_KIT.onKitEvent?.(arrow, context, combatant);

    expect(kitEffectState.effects.filter((effect) => effect.kind === "buff")).toStrictEqual([]);
  });

  test("a Constellation 1 switch lengthens the Aurous Blaze it marks by 4 seconds", () => {
    expect.hasAssertions();
    const combatant = { ...createYoimiyaCombatant(), constellationCount: 1 };
    const context = createKitTestContext(combatant);
    const marked = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    YOIMIYA_KIT.elementalBurst.onStart?.(context);
    YOIMIYA_KIT.onKitEvent?.(
      createDamageTakenEvent(marked, takeOne(YOIMIYA_KIT.elementalBurst.hits), combatant, AttackTag.ElementalBurst),
      context,
      combatant,
    );

    expect(marked.statuses.map(({ id, secondsRemaining }) => [id, secondsRemaining])).toStrictEqual([
      ["yoimiya-aurous-blaze", 14],
    ]);
  });

  test("a Constellation 1 switch raises her ATK by 20% for 20 seconds when a marked enemy is defeated", () => {
    expect.hasAssertions();
    const combatant = { ...createYoimiyaCombatant(), constellationCount: 1 };
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState });
    const marked = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    YOIMIYA_KIT.elementalBurst.onStart?.(context);
    YOIMIYA_KIT.onKitEvent?.(
      createDamageTakenEvent(marked, takeOne(YOIMIYA_KIT.elementalBurst.hits), combatant, AttackTag.ElementalBurst),
      context,
      combatant,
    );
    YOIMIYA_KIT.onKitEvent?.(
      createDamageTakenEvent(
        marked,
        takeOne(takeOne(YOIMIYA_KIT.normalAttacks).hits),
        combatant,
        AttackTag.NormalAttack,
        true,
      ),
      context,
      combatant,
    );

    expect(readBuffTuples(kitEffectState.effects)).toStrictEqual([[Attribute.AttackPercent, 0.2, 20]]);
  });

  test("a Constellation 0 switch leaves the Aurous Blaze at 10 seconds and raises no ATK on a defeat", () => {
    expect.hasAssertions();
    const combatant = createYoimiyaCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState });
    const marked = createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, "");
    YOIMIYA_KIT.elementalBurst.onStart?.(context);
    YOIMIYA_KIT.onKitEvent?.(
      createDamageTakenEvent(marked, takeOne(YOIMIYA_KIT.elementalBurst.hits), combatant, AttackTag.ElementalBurst),
      context,
      combatant,
    );
    YOIMIYA_KIT.onKitEvent?.(
      createDamageTakenEvent(
        marked,
        takeOne(takeOne(YOIMIYA_KIT.normalAttacks).hits),
        combatant,
        AttackTag.NormalAttack,
        true,
      ),
      context,
      combatant,
    );

    expect([
      marked.statuses.map(({ id, secondsRemaining }) => [id, secondsRemaining]),
      kitEffectState.effects.filter((effect) => effect.kind === "buff"),
    ]).toStrictEqual([[["yoimiya-aurous-blaze", 10]], []]);
  });

  test("a Constellation 2 switch gives Yoimiya 25% Pyro DMG Bonus for 6 seconds on her Pyro CRIT", () => {
    expect.hasAssertions();

    expect(readCriticalBuffs(2, true)).toStrictEqual([[Attribute.PyroDamageBonus, 0.25, 6]]);
  });

  test("a Constellation 1 switch, or a hit that is not a CRIT, gives no Pyro DMG Bonus", () => {
    expect.hasAssertions();

    expect([readCriticalBuffs(1, true), readCriticalBuffs(2, false)]).toStrictEqual([[], []]);
  });
});
