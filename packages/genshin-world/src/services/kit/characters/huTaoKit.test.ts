import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBuff } from "#src/models/kit/KitBuff";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitStance } from "#src/models/kit/KitStance";
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

    expect(HU_TAO_KIT.getPassiveBonuses?.(combatant, 0.5, [])).toStrictEqual([
      { amount: 0.33, attribute: Attribute.PyroDamageBonus },
    ]);
  });

  test("a passive does not take effect below its ascension phase", () => {
    expect.hasAssertions();
    const combatant = { ...createHuTaoCombatant(), ascension: 3 };

    expect(HU_TAO_KIT.getPassiveBonuses?.(combatant, 0.5, [])).toStrictEqual([]);
  });
});
