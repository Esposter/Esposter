import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";
import type { KitCharacterSwappedEvent } from "#src/models/kit/KitCharacterSwappedEvent";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { createTravelerKit } from "#src/services/kit/characters/travelerKit";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createParty } from "#src/services/party/createParty";
import { describe, expect, test, vi } from "vitest";

const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

describe(emitKitEvent, () => {
  test("sends an event to the kit of each deployed member, each as its own combatant", () => {
    expect.hasAssertions();
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>();
    const createCombatant = (characterId: number): Combatant => ({
      ascension: 0,
      attributes: computeCharacterAttributes([]),
      characterId,
      constellationCount: 0,
      elementalResonances: [],
      kit: { ...TRAVELER_KIT, onKitEvent },
      level: 90,
    });
    const deployedCombatant = createCombatant(TRAVELER_CHARACTER_ID);
    const context = {
      activeCombatant: deployedCombatant,
      body: { facing: 0, height: 0, position: { x: 0, z: 0 } },
      enemyMap: new Map(),
      kitEffectState: { effects: [] },
      party: createParty([TRAVELER_CHARACTER_ID]),
      random: () => 0,
    };
    const event: KitCharacterSwappedEvent = {
      characterId: 0,
      kind: KitEventKind.CharacterSwapped,
      previousCharacterId: 0,
    };
    emitKitEvent(
      event,
      new Map([
        [0, createCombatant(0)],
        [TRAVELER_CHARACTER_ID, deployedCombatant],
      ]),
      context,
    );

    expect(onKitEvent).toHaveBeenCalledExactlyOnceWith(event, { ...context, combatant: deployedCombatant });
  });
});
