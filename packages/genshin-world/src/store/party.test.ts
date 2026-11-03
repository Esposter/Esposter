import type { Character } from "#src/models/character/Character";
import type { Kit } from "#src/models/kit/Kit";

import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createParty } from "#src/services/party/createParty";
import { useWorldPartyStore } from "#src/store/party";
import { startTestWorldSession } from "#src/store/session.fixture";
import { describe, expect, test } from "vitest";
import { shallowRef } from "vue";

const charactersOf = (...ids: number[]) => ids.map((id) => ({ id }) as Character);

describe(useWorldPartyStore, () => {
  const FIRST_CHARACTER_ID = 1001;
  const SECOND_CHARACTER_ID = 1002;
  const KIT = {} as Kit;
  const startRoster = (characterIds: number[]) => {
    startTestWorldSession();
    const worldPartyStore = useWorldPartyStore();
    const heldParty = worldPartyStore.party;
    worldPartyStore.start({
      characterDataMap: new Map(),
      characterIdConstellationsMap: shallowRef(new Map()),
      savedCharacters: charactersOf(...characterIds),
      savedParty: createParty(characterIds),
      startingCharacterIdKitMap: new Map(characterIds.map((id) => [id, KIT])),
    });
    return { heldParty, worldPartyStore };
  };

  test("starting the store seats the saved party where the held one stands, so what holds it keeps the same one", () => {
    expect.hasAssertions();

    const { heldParty, worldPartyStore } = startRoster([FIRST_CHARACTER_ID, SECOND_CHARACTER_ID]);

    expect(worldPartyStore.party).toBe(heldParty);
    expect({
      active: worldPartyStore.activeCharacterId,
      deployed: worldPartyStore.deployedCharacterIds,
      members: [...heldParty.characterIdMemberMap.keys()],
    }).toStrictEqual({
      active: FIRST_CHARACTER_ID,
      deployed: [FIRST_CHARACTER_ID, SECOND_CHARACTER_ID],
      members: [FIRST_CHARACTER_ID, SECOND_CHARACTER_ID],
    });
  });

  test("a deployed character whose kit is held needs no read", () => {
    expect.hasAssertions();

    const { worldPartyStore } = startRoster([FIRST_CHARACTER_ID]);

    expect([...worldPartyStore.characterIdKitMap.keys()]).toStrictEqual([FIRST_CHARACTER_ID]);
  });

  test("stopping the store gives the roster back to the Traveler's empty party", () => {
    expect.hasAssertions();

    const { heldParty, worldPartyStore } = startRoster([FIRST_CHARACTER_ID]);
    worldPartyStore.stop();

    expect(worldPartyStore.party).toBe(heldParty);
    expect({
      characters: worldPartyStore.characters,
      deployed: worldPartyStore.deployedCharacterIds,
      kits: worldPartyStore.characterIdKitMap.size,
    }).toStrictEqual({ characters: [], deployed: [TRAVELER_CHARACTER_ID], kits: 0 });
  });
});
