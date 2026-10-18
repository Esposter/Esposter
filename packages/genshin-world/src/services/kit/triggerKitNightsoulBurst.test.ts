import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { NATLAN_REGION_ID } from "#src/services/natlan/constants";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { triggerKitNightsoulBurst } from "#src/services/kit/triggerKitNightsoulBurst";
import { IANSAN_CHARACTER_ID } from "#src/services/kit/characters/iansanKit";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test } from "vitest";

const IANSAN_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, IANSAN_CHARACTER_ID);
const ENEMY = {} as Enemy;

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
  const context = createKitTestContext(members[0] as Combatant, {
    characterIdCombatantMap: new Map(members.map((member) => [member.characterId, member])),
    party: createParty(members.map(({ characterId }) => characterId)),
  });
  return { bursts, context, members };
};

describe(triggerKitNightsoulBurst, () => {
  test("a party member's elemental hit triggers the team's Nightsoul burst while a Natlan member is in the party, and the kits hear it", () => {
    expect.hasAssertions();
    const { bursts, context, members } = createTeam(1);
    triggerKitNightsoulBurst(ENEMY, members[0] as Combatant, Element.Electro, context);
    expect(bursts).toStrictEqual([{ enemy: ENEMY, kind: KitEventKind.NightsoulBurst, striker: members[0] }]);
  });

  test("a hit with no element triggers no Nightsoul burst", () => {
    expect.hasAssertions();
    const { bursts, context, members } = createTeam(1);
    triggerKitNightsoulBurst(ENEMY, members[0] as Combatant, undefined, context);
    expect(bursts).toHaveLength(0);
  });

  test("a party with no Natlan member triggers no Nightsoul burst", () => {
    expect.hasAssertions();
    const { bursts, context, members } = createTeam(2, "mondstadt");
    triggerKitNightsoulBurst(ENEMY, members[0] as Combatant, Element.Hydro, context);
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
      triggerKitNightsoulBurst(ENEMY, members[0] as Combatant, Element.Pyro, context);
      stepKitSeconds(context, interval - 0.5);
      triggerKitNightsoulBurst(ENEMY, members[0] as Combatant, Element.Pyro, context);
      expect(bursts).toHaveLength(1);
      stepKitSeconds(context, 1);
      triggerKitNightsoulBurst(ENEMY, members[0] as Combatant, Element.Pyro, context);
      expect(bursts).toHaveLength(2);
    }
  });
});
