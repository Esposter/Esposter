import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { collectDelayedKitEnergy } from "#src/services/kit/effects/collectDelayedKitEnergy";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const wielder: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
const DELAY_ID = "seedEnergy";
const createExpiry = (id: string): KitEvent => ({
  effect: { characterId: TRAVELER_CHARACTER_ID, id, kind: "status", secondsRemaining: 0, stacks: 6 },
  kind: KitEventKind.EffectExpired,
});

describe(collectDelayedKitEnergy, () => {
  test("the delay running out gives its character the energy it held", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    collectDelayedKitEnergy(createExpiry(DELAY_ID), context, wielder, DELAY_ID);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(6);
  });

  test("the running out of another status gives no energy", () => {
    expect.hasAssertions();

    const context = createKitTestContext(wielder);
    collectDelayedKitEnergy(createExpiry("otherStatus"), context, wielder, DELAY_ID);

    expect(getPartyMember(context.party, TRAVELER_CHARACTER_ID).energy).toBe(0);
  });
});
