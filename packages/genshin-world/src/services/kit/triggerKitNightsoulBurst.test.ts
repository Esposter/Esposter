import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { NATLAN_REGION_ID } from "#src/services/natlan/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { triggerKitNightsoulBurst } from "#src/services/kit/triggerKitNightsoulBurst";
import { IANSAN_CHARACTER_ID } from "#src/services/kit/characters/iansanKit";
import { createParty } from "#src/services/party/createParty";
import { stepPartyCooldowns } from "#src/services/party/stepPartyCooldowns";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const IANSAN_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, IANSAN_CHARACTER_ID);

// The given seconds run through the team's effects and its cooldowns, which the world steps together
const stepTeamSeconds = (context: KitContext, seconds: number) => {
  stepKitSeconds(context, seconds);
  stepPartyCooldowns(context.party, seconds);
};

// A team of the given size, its members from the given region, each with a kit that records the Nightsoul bursts the
// Team's kits hear, which the first member's kit alone records, since every kit of the team hears each one
const createTeam = (size: number, regionId = NATLAN_REGION_ID) => {
  const bursts: KitEvent[] = [];
  const members: Combatant[] = Array.from({ length: size }, (_, index) => ({
    ascension: 0,
    attributes: computeCharacterAttributes([]),
    characterId: IANSAN_CHARACTER_ID + index,
    constellationCount: 0,
    elementalResonances: [],
    kit: {
      ...IANSAN_KIT,
      onKitEvent: (event: KitEvent, _context: KitContext, _combatant: Combatant) => {
        if (index === 0 && event.kind === KitEventKind.NightsoulBurst) bursts.push(event);
      },
    },
    level: 90,
    regionId,
  }));
  const context = createKitTestContext(takeOne(members), {
    characterIdCombatantMap: new Map(members.map((member) => [member.characterId, member])),
    party: createParty(members.map(({ characterId }) => characterId)),
  });
  return { bursts, context, members };
};

describe(triggerKitNightsoulBurst, () => {
  const ENEMY = {} as Enemy;

  test("a party member's damage triggers the team's Nightsoul burst while a Natlan member is in the party, and the kits hear it", () => {
    expect.hasAssertions();
    const { bursts, context, members } = createTeam(1);
    triggerKitNightsoulBurst(ENEMY, takeOne(members), context);
    expect(bursts).toStrictEqual([{ enemy: ENEMY, kind: KitEventKind.NightsoulBurst, striker: members[0] }]);
  });

  test("a party with no Natlan member triggers no Nightsoul burst", () => {
    expect.hasAssertions();
    const { bursts, context, members } = createTeam(2, "mondstadt");
    triggerKitNightsoulBurst(ENEMY, takeOne(members), context);
    expect(bursts).toHaveLength(0);
  });

  test("the burst waits out its interval, 18 seconds with one Natlan member, 12 with two, and 9 with three or four", () => {
    expect.hasAssertions();
    for (const [size, interval] of [
      [1, 18],
      [2, 12],
      [3, 9],
      [4, 9],
    ] as const) {
      const { bursts, context, members } = createTeam(size);
      triggerKitNightsoulBurst(ENEMY, takeOne(members), context);
      stepTeamSeconds(context, interval - 0.5);
      triggerKitNightsoulBurst(ENEMY, takeOne(members), context);
      expect(bursts).toHaveLength(1);
      stepTeamSeconds(context, 1);
      triggerKitNightsoulBurst(ENEMY, takeOne(members), context);
      expect(bursts).toHaveLength(2);
    }
  });
});
