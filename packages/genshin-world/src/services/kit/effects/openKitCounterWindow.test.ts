import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitHealthChangedEvent } from "#src/models/kit/KitHealthChangedEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { openKitCounterWindow } from "#src/services/kit/effects/openKitCounterWindow";
import { readCharacterKit } from "#src/services/kit/readCharacterKit";
import { describe, expect, test } from "vitest";

const TRAVELER_KIT = await readCharacterKit(GAME_DATA_LOCAL_BASE_URL, TRAVELER_CHARACTER_ID);
const WINDOW_ID = "test-window";
const WINDOW_SECONDS = 2;
const combatant: Combatant = {
  ascension: 0,
  attributes: computeCharacterAttributes([]),
  characterId: TRAVELER_CHARACTER_ID,
  constellationCount: 0,
  elementalResonances: [],
  kit: TRAVELER_KIT,
  level: 1,
};
const createStrike = (healthShare: number, sourceCharacterId?: number): KitHealthChangedEvent => ({
  bondOfLifeShare: 0,
  characterId: TRAVELER_CHARACTER_ID,
  healthShare,
  kind: KitEventKind.HealthChanged,
  overflowHealthShare: 0,
  healthShareAfter: 0.5,
  healthShareBefore: 0.5,
  ...(sourceCharacterId === undefined ? {} : { sourceCharacterId }),
});

describe(openKitCounterWindow, () => {
  // The window the event opens, as the context's effects hold it after the call
  const openWindow = (event: KitEvent, isSkillHeld = true, characterId = TRAVELER_CHARACTER_ID) => {
    const context = createKitTestContext(combatant, { isSkillHeld });
    openKitCounterWindow(context, event, characterId, { id: WINDOW_ID, seconds: WINDOW_SECONDS });
    return context.kitEffectState.effects;
  };
  const strikeOnOther: KitEvent = { ...createStrike(-0.1), characterId: 2 };

  test("a strike on the character holding its skill opens a window for its seconds", () => {
    expect.hasAssertions();

    expect(openWindow(createStrike(-0.1))).toStrictEqual([
      { characterId: TRAVELER_CHARACTER_ID, id: WINDOW_ID, kind: "status", secondsRemaining: WINDOW_SECONDS },
    ]);
  });

  test("a shield taking a strike for the character holding its skill opens it too", () => {
    expect.hasAssertions();

    const shieldAbsorbed: KitEvent = {
      amount: 50,
      characterId: 2,
      kind: KitEventKind.ShieldAbsorbed,
      struckCharacterId: TRAVELER_CHARACTER_ID,
    };

    expect(openWindow(shieldAbsorbed)).toHaveLength(1);
  });

  test("a strike opens nothing unless the character struck is the one on the field, holding its skill", () => {
    expect.hasAssertions();

    expect([openWindow(createStrike(-0.1), false), openWindow(strikeOnOther, true, 2)]).toStrictEqual([[], []]);
  });

  test("a heal, or an HP loss a kit's source names, opens nothing", () => {
    expect.hasAssertions();

    expect([openWindow(createStrike(0.1)), openWindow(createStrike(-0.1, 2))]).toStrictEqual([[], []]);
  });
});
