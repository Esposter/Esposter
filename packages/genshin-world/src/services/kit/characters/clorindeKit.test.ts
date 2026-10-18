import type { Combatant } from "#src/models/kit/Combatant";
import type { KitAction } from "#src/models/kit/KitAction";
import type { KitSummon } from "#src/models/kit/KitSummon";
import type { Party } from "#src/models/party/Party";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { WeaponType } from "#src/models/weapon/WeaponType";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { CLORINDE_CHARACTER_ID, createClorindeKitBehaviour } from "#src/services/kit/characters/clorindeKit";
import { findKitStance } from "#src/services/kit/effects/findKitStance";
import { createKitTestContext, castKitAction } from "#src/services/kit/createKitTestContext.test";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const CLORINDE_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, CLORINDE_CHARACTER_ID);

const createClorindeCombatant = (constellationCount: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
  characterId: CLORINDE_CHARACTER_ID,
  constellationCount,
  elementalResonances: [],
  kit: CLORINDE_KIT,
  level: 90,
  weaponType: WeaponType.Sword,
});

// A party with Clorinde on it, her Bond of Life share and her HP share set
const createClorindeParty = (bondOfLifeShare: number, healthShare = 1): Party => {
  const party = createParty([CLORINDE_CHARACTER_ID]);
  const partyMember = getPartyMember(party, CLORINDE_CHARACTER_ID);
  partyMember.bondOfLifeShare = bondOfLifeShare;
  partyMember.healthShare = healthShare;
  return party;
};

// Hunter's Vigil's press starts Night Vigil, then the stance action that `pickAction` gives is started in `party`, and the
// Summons that action cast are returned
const castNightVigilAction = (party: Party, pickAction: (stance: Combatant) => KitAction | undefined): KitSummon[] => {
  const kitEffectState = castKitAction(CLORINDE_KIT.elementalSkill, createClorindeCombatant(0));
  const stance = findKitStance(kitEffectState.effects, CLORINDE_CHARACTER_ID)?.combatant;
  if (stance === undefined) return [];
  pickAction(stance)?.onStart?.(createKitTestContext(stance, { kitEffectState, party }));
  return kitEffectState.effects.filter((effect): effect is KitSummon => effect.kind === "summon");
};

describe(createClorindeKitBehaviour, () => {
  test("an active constellation's switch changes its character's kit", () => {
    expect.hasAssertions();
    const kitEffectState = castKitAction(CLORINDE_KIT.elementalSkill, createClorindeCombatant(6));

    expect(
      kitEffectState.effects.find((effect) => effect.kind === "buff" && effect.attribute === Attribute.CriticalRate),
    ).toStrictEqual({
      amount: 0.1,
      attribute: Attribute.CriticalRate,
      characterId: CLORINDE_CHARACTER_ID,
      kind: "buff",
      secondsRemaining: 12,
    });
    expect(
      kitEffectState.effects.find((effect) => effect.kind === "buff" && effect.attribute === Attribute.CriticalDamage),
    ).toStrictEqual({
      amount: 0.7,
      attribute: Attribute.CriticalDamage,
      characterId: CLORINDE_CHARACTER_ID,
      kind: "buff",
      secondsRemaining: 12,
    });
  });

  test("an inactive constellation changes nothing", () => {
    expect.hasAssertions();
    const kitEffectState = castKitAction(CLORINDE_KIT.elementalSkill, createClorindeCombatant(5));

    expect(kitEffectState.effects).toHaveLength(0);
  });

  test("reads the burst's cooldown and cost, the charged attack's stamina and the strikes' multipliers from her proud skill groups", () => {
    expect.hasAssertions();

    expect({
      burstCooldownSeconds: CLORINDE_KIT.burstCooldownSeconds,
      burstEnergyCost: CLORINDE_KIT.burstEnergyCost,
      chargedAttackStamina: CLORINDE_KIT.chargedAttackStamina,
      fifthStrike: CLORINDE_KIT.normalAttacks[4]?.hits[0]?.talentMultiplier,
      multipliers: CLORINDE_KIT.normalAttacks.slice(0, 2).map(({ hits }) => hits[0]?.talentMultiplier),
    }).toStrictEqual({
      burstCooldownSeconds: 15,
      burstEnergyCost: 60,
      chargedAttackStamina: 20,
      fifthStrike: expect.closeTo(0.9001, 3),
      multipliers: [expect.closeTo(0.5406, 3), expect.closeTo(0.5163, 3)],
    });
  });

  test("lightfall strikes five times, the last at 121 frames within its 128-frame animation", () => {
    expect.hasAssertions();

    expect({
      hitCount: CLORINDE_KIT.elementalBurst.hits.length,
      lastHitmarkSeconds: CLORINDE_KIT.elementalBurst.hits.at(-1)?.hitmarkSeconds,
    }).toStrictEqual({ hitCount: 5, lastHitmarkSeconds: 121 / 60 });
  });

  test("hunter's vigil's press starts night vigil for its table's 7.5 seconds, which a swap ends", () => {
    expect.hasAssertions();
    const kitEffectState = castKitAction(CLORINDE_KIT.elementalSkill, createClorindeCombatant(0));

    const stance = findKitStance(kitEffectState.effects, CLORINDE_CHARACTER_ID);
    expect(stance?.isEndedOnSwap).toBe(true);
    expect(stance?.secondsRemaining).toBe(7.5);
  });

  test("swift hunt's second step casts its piercing shot below 100% bond of life share, and its normal shot at 100%", () => {
    expect.hasAssertions();

    expect(
      castNightVigilAction(createClorindeParty(0.5), (stance) => stance.kit.normalAttacks.at(1)).flatMap(({ hits }) =>
        hits.map(({ hitArea }) => hitArea.radius),
      ),
    ).toStrictEqual([14]);
    expect(
      castNightVigilAction(createClorindeParty(1), (stance) => stance.kit.normalAttacks.at(1)).flatMap(({ hits }) =>
        hits.map(({ hitArea }) => hitArea.radius),
      ),
    ).toStrictEqual([0.6]);
  });

  test("impale the night casts its three-hit variant at 100% bond of life share, and one hit below it", () => {
    expect.hasAssertions();

    expect(
      castNightVigilAction(createClorindeParty(1), (stance) => stance.kit.elementalSkill).flatMap(({ hits }) => hits),
    ).toHaveLength(3);
    expect(
      castNightVigilAction(createClorindeParty(0.5), (stance) => stance.kit.elementalSkill).flatMap(({ hits }) => hits),
    ).toHaveLength(1);
  });

  test("impale the night clears the bond of life a low share carries, and heals her by the rest of its healing", () => {
    expect.hasAssertions();
    const party = createClorindeParty(0.5, 0.5);

    castNightVigilAction(party, (stance) => stance.kit.elementalSkill);

    const partyMember = getPartyMember(party, CLORINDE_CHARACTER_ID);
    expect(partyMember.bondOfLifeShare).toBe(0);
    expect(partyMember.healthShare).toBeGreaterThan(0.5);
  });

  test("impale the night heals her by nothing at no bond of life share", () => {
    expect.hasAssertions();
    const party = createClorindeParty(0, 0.5);

    castNightVigilAction(party, (stance) => stance.kit.elementalSkill);

    expect(getPartyMember(party, CLORINDE_CHARACTER_ID).healthShare).toBe(0.5);
  });
});
