import type { Combatant } from "#src/models/kit/Combatant";
import type { KitPickUp } from "#src/models/kit/KitPickUp";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { pickUpKitPickUps } from "#src/services/kit/pickUpKitPickUps";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test, vi } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);

describe(pickUpKitPickUps, () => {
  const RADIUS = 2;
  const SECONDS = 4;
  const PICKABLE_SECONDS = SECONDS - 0.3;
  const combatant: Combatant = {
    ascension: 0,
    attributes: computeCharacterAttributes([{ attribute: Attribute.Health, value: 1000 }]),
    characterId: TRAVELER_CHARACTER_ID,
    constellationCount: 0,
    elementalResonances: [],
    kit: TRAVELER_KIT,
    level: 1,
  };
  const createPickUp = (x: number, secondsRemaining: number): KitPickUp => ({
    characterId: TRAVELER_CHARACTER_ID,
    id: "snack",
    kind: "pickUp",
    onPickedUp: vi.fn<KitPickUp["onPickedUp"]>(),
    pickableSeconds: PICKABLE_SECONDS,
    position: { x, z: 0 },
    radius: RADIUS,
    secondsRemaining,
  });

  test("the character on the field picks up a pick-up in reach once it may be, taking it off the team's effects and doing what it does", () => {
    expect.hasAssertions();

    const pickUp = createPickUp(RADIUS, PICKABLE_SECONDS);
    const context = createKitTestContext(combatant, { kitEffectState: { effects: [pickUp] } });
    pickUpKitPickUps(context, { x: 0, z: 0 });

    expect(context.kitEffectState.effects).toStrictEqual([]);
    expect(pickUp.onPickedUp).toHaveBeenCalledExactlyOnceWith(context, pickUp);
  });

  test.each<[string, number, number]>([
    ["before it may be", 0, PICKABLE_SECONDS + 0.01],
    ["out of reach", RADIUS + 0.01, PICKABLE_SECONDS],
  ])("leaves a pick-up %s where it lies", (_description, x, secondsRemaining) => {
    expect.hasAssertions();

    const pickUp = createPickUp(x, secondsRemaining);
    const context = createKitTestContext(combatant, { kitEffectState: { effects: [pickUp] } });
    pickUpKitPickUps(context, { x: 0, z: 0 });

    expect(context.kitEffectState.effects).toStrictEqual([pickUp]);
    expect(pickUp.onPickedUp).not.toHaveBeenCalled();
  });
});
