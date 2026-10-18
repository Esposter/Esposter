import type { EnemyStatus } from "#src/models/enemy/EnemyStatus";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitStance } from "#src/models/kit/KitStance";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { KitSummon } from "#src/models/kit/KitSummon";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { ENEMY_CAMP_MEMBER } from "#src/services/enemy/constants.test";
import { createEnemy } from "#src/services/enemy/createEnemy";
import { readEnemyTables } from "#src/services/enemy/readEnemyTables";
import { createHuTaoKitBehaviour, HU_TAO_CHARACTER_ID } from "#src/services/kit/characters/huTaoKit";
import { castKitAction, createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { hitPartyMember } from "#src/services/kit/hitPartyMember";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { tickEnemyStatuses } from "#src/services/kit/tickEnemyStatuses";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const HU_TAO_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, HU_TAO_CHARACTER_ID);
const enemyTables = await readEnemyTables(GAME_DATA_LOCAL_BASE_URL);
const createHuTaoCombatant = (): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: HU_TAO_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: HU_TAO_KIT,
  level: 90,
  weaponType: WeaponType.Polearm,
});

// A party with Hu Tao on the field at the given share of her Max HP
const createHuTaoParty = (healthShare: number) => {
  const party = createParty([HU_TAO_CHARACTER_ID]);
  getPartyMember(party, HU_TAO_CHARACTER_ID).healthShare = healthShare;
  return party;
};

describe(createHuTaoKitBehaviour, () => {
  test("guide to Afterlife holds the Paramita stance, its Pyro infusion and an ATK share of her Max HP", () => {
    expect.hasAssertions();
    const combatant = createHuTaoCombatant();
    const kitEffectState: KitEffectState = { effects: [] };

    HU_TAO_KIT.elementalSkill.onStart?.(createKitTestContext(combatant, { kitEffectState }));

    const buff = kitEffectState.effects.find((effect): effect is KitBuff => effect.kind === "buff");
    if (!buff) throw new Error("Guide to Afterlife gave no ATK buff");
    const stance = kitEffectState.effects.find((effect) => effect.kind === "stance");
    const infusion = kitEffectState.effects.find((effect) => effect.kind === "infusion");
    expect(stance?.secondsRemaining).toBe(infusion?.secondsRemaining);
    expect(infusion?.element).toBe(Element.Pyro);
    expect(buff.attribute).toBe(Attribute.Attack);
    expect(buff.amount / combatant.attributes.maxHealth).toBeCloseTo(0.03841);
  });

  test("guide to Afterlife takes its HP share of Hu Tao's current HP", () => {
    expect.hasAssertions();
    const party = createHuTaoParty(1);

    HU_TAO_KIT.elementalSkill.onStart?.(createKitTestContext(createHuTaoCombatant(), { party }));

    expect(getPartyMember(party, HU_TAO_CHARACTER_ID).healthShare).toBeCloseTo(0.7);
  });

  test("guide to Afterlife never takes Hu Tao below 1 HP", () => {
    expect.hasAssertions();
    const combatant = createHuTaoCombatant();
    // At 1.2 HP, 30% of her HP would leave her under 1 HP, so the cost stops at 1
    const party = createHuTaoParty(1.2 / combatant.attributes.maxHealth);

    HU_TAO_KIT.elementalSkill.onStart?.(createKitTestContext(combatant, { party }));

    const { healthShare } = getPartyMember(party, HU_TAO_CHARACTER_ID);
    expect(healthShare * combatant.attributes.maxHealth).toBeCloseTo(1);
  });

  test.each([
    [0.5, true],
    [0.6, false],
  ])("the burst's low HP variant is played at %s of HP", (healthShare, isActive) => {
    expect.hasAssertions();
    const combatant = createHuTaoCombatant();

    expect(
      HU_TAO_KIT.elementalBurstVariant?.checkIsActive(
        createKitTestContext(combatant, { party: createHuTaoParty(healthShare) }),
      ),
    ).toBe(isActive);
  });

  test("the Paramita's charged attack puts Blood Blossom on the enemies it hits, and its tick strikes the one enemy", () => {
    expect.hasAssertions();
    const combatant = createHuTaoCombatant();
    const kitEffectState: KitEffectState = { effects: [] };
    HU_TAO_KIT.elementalSkill.onStart?.(createKitTestContext(combatant, { kitEffectState }));
    const stance = kitEffectState.effects.find((effect): effect is KitStance => effect.kind === "stance");
    const bloodBlossom = stance?.combatant.kit.chargedAttack.hits[0]?.enemyStatus?.(combatant);
    if (!bloodBlossom) throw new Error("the Paramita's charged attack gave no Blood Blossom");
    const enemy = { ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""), statuses: [bloodBlossom] };

    // Each tick falls due one interval on, which a step of that many seconds reaches
    const outbox: KitEvent[] = [];
    tickEnemyStatuses([enemy], bloodBlossom.tickIntervalSeconds ?? 0, outbox);
    for (const event of outbox)
      HU_TAO_KIT.onKitEvent?.(
        event,
        createKitTestContext(combatant, { enemyMap: new Map([[enemy.id, enemy]]), kitEffectState }),
        combatant,
      );

    const tick = kitEffectState.effects.find((effect): effect is KitSummon => effect.kind === "summon");
    expect(tick?.target).toBe(enemy);
  });

  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();
    const combatant = { ...createHuTaoCombatant(), constellationCount: 1 };
    const kitEffectState = castKitAction(HU_TAO_KIT.elementalSkill, combatant);

    expect(HU_TAO_KIT.getChargedAttackStaminaMultiplier?.(createKitTestContext(combatant, { kitEffectState }))).toBe(0);
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();
    const combatant = createHuTaoCombatant();
    const kitEffectState = castKitAction(HU_TAO_KIT.elementalSkill, combatant);

    expect(HU_TAO_KIT.getChargedAttackStaminaMultiplier?.(createKitTestContext(combatant, { kitEffectState }))).toBe(1);
  });
});

describe("flutter By", () => {
  const TEAMMATE_CHARACTER_ID = 1;

  // Guide to Afterlife's Paramita stance, which its end gives the allies Flutter By's CRIT Rate from, then ends
  const endParamitaStance = (ascension: number) => {
    const combatant = { ...createHuTaoCombatant(), ascension };
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, {
      kitEffectState,
      party: createParty([HU_TAO_CHARACTER_ID, TEAMMATE_CHARACTER_ID]),
    });
    HU_TAO_KIT.elementalSkill.onStart?.(context);
    const stance = kitEffectState.effects.find((effect): effect is KitStance => effect.kind === "stance");
    if (!stance) throw new Error("Guide to Afterlife held no stance");
    HU_TAO_KIT.onKitEvent?.({ effect: stance, kind: KitEventKind.EffectExpired }, context, combatant);
    return kitEffectState.effects.filter(
      (effect): effect is KitBuff => effect.kind === "buff" && effect.attribute === Attribute.CriticalRate,
    );
  };

  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();

    expect(endParamitaStance(1)).toStrictEqual([
      {
        amount: 0.12,
        attribute: Attribute.CriticalRate,
        characterId: TEAMMATE_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 8,
        source: "hu-tao-a1",
      },
    ]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();

    expect(endParamitaStance(0)).toStrictEqual([]);
  });
});

describe("sanguine Rouge", () => {
  test("a passive takes effect at its ascension phase", () => {
    expect.hasAssertions();
    const combatant = { ...createHuTaoCombatant(), ascension: 4 };

    expect(HU_TAO_KIT.getPassiveBonuses?.(combatant, 0.5, [], [])).toStrictEqual([
      { amount: 0.33, attribute: Attribute.PyroDamageBonus },
    ]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();
    const combatant = { ...createHuTaoCombatant(), ascension: 3 };

    expect(HU_TAO_KIT.getPassiveBonuses?.(combatant, 0.5, [], [])).toStrictEqual([]);
  });
});

// Hu Tao's share of her Max HP in the context's party
const getHealthShare = (context: KitContext) => getPartyMember(context.party, HU_TAO_CHARACTER_ID).healthShare;
// A context with Hu Tao on the field at the given share of her HP
const createSpiritSooterContext = (healthShare: number) =>
  createKitTestContext(createHuTaoCombatant(), { party: createHuTaoParty(healthShare) });
// One enemy struck by the given hit of Spirit Soother
const strikeEnemy = (context: KitContext, hit: KitStrike["hit"] | undefined) => {
  if (!hit?.onStrike) throw new Error("Spirit Soother's hit has no strike to land");
  hit.onStrike(context, { body: context.body, combatant: context.activeCombatant, hit });
};
// Spirit Soother's heal shares of Max HP at her first level, as gcsim v2.47.2 (MIT) hutao's proud skill group 4639 gives
// The share above half of her HP, and the larger one at or under it
const SPIRIT_SOOTHER_REGEN_SHARE = 0.062625;
const SPIRIT_SOOTHER_LOW_REGEN_SHARE = 0.0835;

describe("spirit Soother", () => {
  test("the Spirit Soother heals Hu Tao above half HP", () => {
    expect.hasAssertions();
    const context = createSpiritSooterContext(0.6);

    HU_TAO_KIT.elementalBurst.onStart?.(context);
    strikeEnemy(context, HU_TAO_KIT.elementalBurst.hits[0]);

    expect(getHealthShare(context)).toBeCloseTo(0.6 + SPIRIT_SOOTHER_REGEN_SHARE);
  });

  test("the Spirit Soother heals Hu Tao more at or below half HP", () => {
    expect.hasAssertions();
    const context = createSpiritSooterContext(0.5);

    HU_TAO_KIT.elementalBurstVariant?.action.onStart?.(context);
    strikeEnemy(context, HU_TAO_KIT.elementalBurstVariant?.action.hits[0]);

    expect(getHealthShare(context)).toBeCloseTo(0.5 + SPIRIT_SOOTHER_LOW_REGEN_SHARE);
  });

  test("the Spirit Soother heals at most five times a cast", () => {
    expect.hasAssertions();
    const context = createSpiritSooterContext(0.1);

    HU_TAO_KIT.elementalBurst.onStart?.(context);
    for (let index = 0; index < 6; index++) strikeEnemy(context, HU_TAO_KIT.elementalBurst.hits[0]);

    expect(getHealthShare(context)).toBeCloseTo(0.1 + 5 * SPIRIT_SOOTHER_LOW_REGEN_SHARE);
  });

  test("a new cast of the Spirit Soother starts its heals again", () => {
    expect.hasAssertions();
    const context = createSpiritSooterContext(0.1);

    HU_TAO_KIT.elementalBurst.onStart?.(context);
    for (let index = 0; index < 5; index++) strikeEnemy(context, HU_TAO_KIT.elementalBurst.hits[0]);
    HU_TAO_KIT.elementalBurst.onStart?.(context);
    strikeEnemy(context, HU_TAO_KIT.elementalBurst.hits[0]);

    expect(getHealthShare(context)).toBeCloseTo(0.1 + 5 * SPIRIT_SOOTHER_LOW_REGEN_SHARE + SPIRIT_SOOTHER_REGEN_SHARE);
  });
});

describe("constellation 4 and 6", () => {
  const TEAMMATE_CHARACTER_ID = 1;
  const BLOOD_BLOSSOM: EnemyStatus = {
    damageTakenBonus: 0,
    id: "hu-tao-blood-blossom",
    nextTickSeconds: 1,
    secondsRemaining: 10,
    tickIntervalSeconds: 1,
  };

  // The CRIT Rate buffs on the party after an enemy with the given statuses is defeated at a constellation
  const defeatEnemy = (constellationCount: number, statuses: EnemyStatus[]) => {
    const combatant = { ...createHuTaoCombatant(), constellationCount };
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, {
      kitEffectState,
      party: createParty([HU_TAO_CHARACTER_ID, TEAMMATE_CHARACTER_ID]),
    });
    const enemy = { ...createEnemy(enemyTables, [], ENEMY_CAMP_MEMBER, ""), statuses };
    HU_TAO_KIT.onKitEvent?.({ enemy, kind: KitEventKind.EnemyDefeated, striker: combatant }, context, combatant);
    return kitEffectState.effects.filter(
      (effect): effect is KitBuff => effect.kind === "buff" && effect.attribute === Attribute.CriticalRate,
    );
  };

  // The CRIT Rate buffs on Hu Tao after she loses HP the given number of times, leaving her at the given share of her Max HP
  const drainHuTao = (constellationCount: number, healthShare: number, drains = 1) => {
    const combatant = { ...createHuTaoCombatant(), constellationCount };
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState, party: createHuTaoParty(healthShare) });
    for (let drain = 0; drain < drains; drain++)
      HU_TAO_KIT.onKitEvent?.(
        {
          bondOfLifeShare: 0,
          characterId: HU_TAO_CHARACTER_ID,
          healthShare: -0.1,
          kind: KitEventKind.HealthChanged,
          overflowHealthShare: 0,
        },
        context,
        combatant,
      );
    return kitEffectState.effects.filter(
      (effect): effect is KitBuff => effect.kind === "buff" && effect.attribute === Attribute.CriticalRate,
    );
  };

  test("at constellation 4, defeating an enemy Blood Blossom marked gives each other member CRIT Rate for 15 seconds", () => {
    expect.hasAssertions();

    expect(defeatEnemy(4, [BLOOD_BLOSSOM])).toStrictEqual([
      {
        amount: 0.12,
        attribute: Attribute.CriticalRate,
        characterId: TEAMMATE_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 15,
        source: "hu-tao-c4",
      },
    ]);
  });

  test("defeating an enemy that Blood Blossom did not mark gives no CRIT Rate", () => {
    expect.hasAssertions();

    expect(defeatEnemy(4, [])).toStrictEqual([]);
  });

  test("defeating an enemy whose Blood Blossom has run out gives no CRIT Rate", () => {
    expect.hasAssertions();

    expect(defeatEnemy(4, [{ ...BLOOD_BLOSSOM, secondsRemaining: 0 }])).toStrictEqual([]);
  });

  test("below constellation 4, defeating an enemy Blood Blossom marked gives no CRIT Rate", () => {
    expect.hasAssertions();

    expect(defeatEnemy(3, [BLOOD_BLOSSOM])).toStrictEqual([]);
  });

  test("at constellation 6, a drop to 25% HP or less sets Hu Tao's CRIT Rate to 100% for 10 seconds", () => {
    expect.hasAssertions();

    expect(drainHuTao(6, 0.25)).toStrictEqual([
      {
        amount: 1,
        attribute: Attribute.CriticalRate,
        characterId: HU_TAO_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 10,
        source: "hu-tao-c6",
      },
    ]);
  });

  test("above 25% HP, a drop gives Hu Tao no CRIT Rate", () => {
    expect.hasAssertions();

    expect(drainHuTao(6, 0.5)).toStrictEqual([]);
  });

  test("a second drop to 25% HP within 60 seconds gives Hu Tao no more CRIT Rate", () => {
    expect.hasAssertions();

    expect(drainHuTao(6, 0.2, 2)).toHaveLength(1);
  });

  test("below constellation 6, a drop to 25% HP or less gives Hu Tao no CRIT Rate", () => {
    expect.hasAssertions();

    expect(drainHuTao(5, 0.2)).toStrictEqual([]);
  });

  // Hu Tao's share of her Max HP after each of the given lethal hits, from full HP, at the given constellation
  const takeLethalHits = (constellationCount: number, hits: number) => {
    const combatant = { ...createHuTaoCombatant(), constellationCount };
    const party = createParty([HU_TAO_CHARACTER_ID]);
    const kitEffectState: KitEffectState = { effects: [] };
    return Array.from({ length: hits }, () => {
      hitPartyMember(party, combatant, kitEffectState, combatant.attributes.maxHealth);
      return getPartyMember(party, HU_TAO_CHARACTER_ID).healthShare;
    });
  };

  test("at constellation 6, a lethal hit leaves Hu Tao at 1 HP, and a second within a minute takes her down", () => {
    expect.hasAssertions();

    const { attributes } = createHuTaoCombatant();

    expect(takeLethalHits(6, 2)).toStrictEqual([1 / attributes.maxHealth, 0]);
  });

  test("below constellation 6, a lethal hit takes Hu Tao down", () => {
    expect.hasAssertions();

    expect(takeLethalHits(5, 1)).toStrictEqual([0]);
  });

  test("at constellation 6, a refused fall gives Hu Tao CRIT Rate of 100% for 10 seconds", () => {
    expect.hasAssertions();

    const combatant = { ...createHuTaoCombatant(), constellationCount: 6 };
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(combatant, { kitEffectState, party: createHuTaoParty(1) });
    HU_TAO_KIT.onKitEvent?.({ characterId: HU_TAO_CHARACTER_ID, kind: KitEventKind.FallRefused }, context, combatant);

    expect(
      kitEffectState.effects.filter(
        (effect): effect is KitBuff => effect.kind === "buff" && effect.attribute === Attribute.CriticalRate,
      ),
    ).toStrictEqual([
      {
        amount: 1,
        attribute: Attribute.CriticalRate,
        characterId: HU_TAO_CHARACTER_ID,
        kind: "buff",
        secondsRemaining: 10,
        source: "hu-tao-c6",
      },
    ]);
  });
});
