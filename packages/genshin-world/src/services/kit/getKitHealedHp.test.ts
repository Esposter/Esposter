import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { changeKitMemberHealth } from "#src/services/kit/effects/changeKitMemberHealth";
import { getKitHealedHp } from "#src/services/kit/getKitHealedHp";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(getKitHealedHp, () => {
  const member: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.BaseHealth, value: 10_000 }]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: KIT,
    level: 1,
  };
  const combatantMap = new Map([[TRAVELER_CHARACTER_ID, member]]);
  const healthChanged = {
    bondOfLifeShare: 0,
    characterId: TRAVELER_CHARACTER_ID,
    healthShare: 0,
    isFallRefused: false,
    kind: KitEventKind.HealthChanged,
    overflowHealthShare: 0,
  } as const;
  const party = createParty([TRAVELER_CHARACTER_ID]);
  // A 20% HealthPercent buff, which raises the member's Max HP from 10,000 to 12,000
  const healthBuffs: KitEffect[] = [
    {
      amount: 0.2,
      attribute: Attribute.HealthPercent,
      characterId: TRAVELER_CHARACTER_ID,
      kind: "buff",
      secondsRemaining: 1,
    },
  ];

  test("counts the HP a heal restores as its share of the healed member's Max HP", () => {
    expect.hasAssertions();

    expect(
      getKitHealedHp(
        {
          bondOfLifeShare: 0,
          characterId: TRAVELER_CHARACTER_ID,
          healthShare: 0.25,
          isFallRefused: false,
          kind: KitEventKind.HealthChanged,
          overflowHealthShare: 0,
        },
        [],
        party,
        combatantMap,
      ),
    ).toBe(0.25 * member.attributes.maxHealth);
  });

  test("counts the overflow past full HP, which a heal on a member at full HP leaves", () => {
    expect.hasAssertions();

    expect(
      getKitHealedHp(
        {
          bondOfLifeShare: 0,
          characterId: TRAVELER_CHARACTER_ID,
          healthShare: 0,
          isFallRefused: false,
          kind: KitEventKind.HealthChanged,
          overflowHealthShare: 0.1,
        },
        [],
        party,
        combatantMap,
      ),
    ).toBe(0.1 * member.attributes.maxHealth);
  });

  test("counts the share a Bond of Life took before the HP was restored", () => {
    expect.hasAssertions();

    expect(
      getKitHealedHp(
        {
          bondOfLifeShare: 0.25,
          characterId: TRAVELER_CHARACTER_ID,
          healthShare: 0.125,
          isFallRefused: false,
          kind: KitEventKind.HealthChanged,
          overflowHealthShare: 0,
        },
        [],
        party,
        combatantMap,
      ),
    ).toBe(0.375 * member.attributes.maxHealth);
  });

  test("counts the share against the member's Max HP as its buffs raise it", () => {
    expect.hasAssertions();

    expect(
      getKitHealedHp(
        {
          bondOfLifeShare: 0,
          characterId: TRAVELER_CHARACTER_ID,
          healthShare: 0.1,
          isFallRefused: false,
          kind: KitEventKind.HealthChanged,
          overflowHealthShare: 0,
        },
        healthBuffs,
        party,
        combatantMap,
      ),
    ).toBe(1200);
  });

  test("reads back the HP a heal under a Max HP buff restored, as changeKitMemberHealth records it", () => {
    expect.hasAssertions();
    const healedParty = createParty([TRAVELER_CHARACTER_ID]);
    changeKitMemberHealth(
      createKitTestContext(member, {
        characterIdCombatantMap: combatantMap,
        kitEffectState: { effects: healthBuffs },
        party: healedParty,
      }),
      member,
      TRAVELER_CHARACTER_ID,
      1200,
    );
    const { bondOfLifeShare, characterId, healthShare, isFallRefused, overflowHealthShare } = takeOne(
      healedParty.healthChanges,
    );

    expect(
      getKitHealedHp(
        {
          bondOfLifeShare,
          characterId,
          healthShare,
          isFallRefused,
          kind: KitEventKind.HealthChanged,
          overflowHealthShare,
        },
        healthBuffs,
        healedParty,
        combatantMap,
      ),
    ).toBe(1200);
  });

  test("heals nothing for a drain, or for a member the team does not build", () => {
    expect.hasAssertions();

    const drain = { ...healthChanged, healthShare: -0.2 };

    expect(getKitHealedHp(drain, [], party, combatantMap)).toBe(0);
    expect(getKitHealedHp({ ...drain, healthShare: 0.2 }, [], party, new Map())).toBe(0);
  });
});
