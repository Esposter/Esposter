import type { Combatant } from "#src/models/kit/Combatant";
import type { KitBurstUsedEvent } from "#src/models/kit/KitBurstUsedEvent";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { EXILE_ARTIFACT_SET_ID } from "#src/services/artifact/constants";
import { createExileSetModule } from "#src/services/artifact/sets/createExileSetModule";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { readStatTables } from "#src/services/character/readStatTables";
import { createKitTestContext, stepKitSeconds } from "#src/services/kit/createKitTestContext.test";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { createParty } from "#src/services/party/createParty";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { takeOne } from "@esposter/shared";
import { assert, describe, expect, test } from "vitest";

const statTables = await readStatTables(GAME_DATA_LOCAL_BASE_URL);
const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

const createPartyCombatant = (characterId: number): Combatant => ({
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
});

const createBurstUsedEvent = (characterId: number): KitBurstUsedEvent => ({
  characterId,
  energyCost: TRAVELER_KIT.burstEnergyCost,
  kind: KitEventKind.BurstUsed,
});

describe(createExileSetModule, () => {
  const exileSetData = statTables.artifactSetDataMap.get(EXILE_ARTIFACT_SET_ID);
  assert.exists(exileSetData);
  const exileSetModule = createExileSetModule(takeOne(exileSetData.bonuses, 1));
  const PARTY_CHARACTER_IDS = [1, 2];
  const wearer = createPartyCombatant(takeOne(PARTY_CHARACTER_IDS, 0));
  const ally = createPartyCombatant(takeOne(PARTY_CHARACTER_IDS, 1));
  // The energy the wearer and the other member hold after each of the given seconds, the team's effects stepped through
  // Them at the world's fixed step
  const stepEnergies = (kitEffectState: KitEffectState, party: Party, secondsList: number[]) =>
    secondsList.map((seconds) => {
      const context = createKitTestContext(wearer, {
        characterIdCombatantMap: new Map([
          [ally.characterId, ally],
          [wearer.characterId, wearer],
        ]),
        kitEffectState,
        party,
      });
      stepKitSeconds(context, seconds);
      return PARTY_CHARACTER_IDS.map((characterId) => getPartyMember(party, characterId).energy);
    });

  test("regenerates 2 energy for every other member every 2 seconds for 6 seconds after its wearer's burst", () => {
    expect.hasAssertions();

    const party = createParty(PARTY_CHARACTER_IDS);
    const kitEffectState: KitEffectState = { effects: [] };
    exileSetModule.onKitEvent?.(
      createBurstUsedEvent(wearer.characterId),
      createKitTestContext(wearer, { kitEffectState, party }),
      wearer,
    );

    expect(stepEnergies(kitEffectState, party, [1.5, 1, 2, 2, 4])).toStrictEqual([
      [0, 0],
      [0, 2],
      [0, 4],
      [0, 6],
      [0, 6],
    ]);
  });

  test("starts no second regeneration on a burst while one still ticks", () => {
    expect.hasAssertions();

    const party = createParty(PARTY_CHARACTER_IDS);
    const kitEffectState: KitEffectState = { effects: [] };
    const context = createKitTestContext(wearer, { kitEffectState, party });
    exileSetModule.onKitEvent?.(createBurstUsedEvent(wearer.characterId), context, wearer);
    stepEnergies(kitEffectState, party, [2.5]);
    exileSetModule.onKitEvent?.(createBurstUsedEvent(wearer.characterId), context, wearer);

    expect(stepEnergies(kitEffectState, party, [8])).toStrictEqual([[0, 6]]);
  });

  test("regenerates nothing on another member's burst", () => {
    expect.hasAssertions();

    const kitEffectState: KitEffectState = { effects: [] };
    exileSetModule.onKitEvent?.(
      createBurstUsedEvent(ally.characterId),
      createKitTestContext(wearer, { kitEffectState, party: createParty(PARTY_CHARACTER_IDS) }),
      wearer,
    );

    expect(kitEffectState.effects).toStrictEqual([]);
  });
});
