import type { Combatant } from "#src/models/kit/Combatant";
import type { Kit } from "#src/models/kit/Kit";

import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { Attribute } from "#src/models/character/Attribute";
import { Element } from "#src/models/Element";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { EnergyDropKind } from "#src/models/shared/EnergyDropKind";
import { computeCharacterAttributes } from "#src/services/character/computeCharacterAttributes";
import { TRAVELER_CHARACTER_ID } from "#src/services/character/constants";
import { SAME_ELEMENT_PARTICLE_ENERGY } from "#src/services/combat/energy/constants";
import { collectKitEnergyDrops } from "#src/services/kit/collectKitEnergyDrops";
import { createKitTestContext } from "#src/services/kit/createKitTestContext.test";
import { readTalentMultipliers } from "#src/services/kit/readTalentMultipliers";
import { createTravelerKit } from "#src/services/kit/travelerKit";
import { getPartyMember } from "#src/services/party/getPartyMember";
import { describe, expect, test, vi } from "vitest";

const TRAVELER_KIT = createTravelerKit(await readTalentMultipliers(GAME_DATA_LOCAL_BASE_URL, [TRAVELER_CHARACTER_ID]));

describe(collectKitEnergyDrops, () => {
  test("gives the team a drop's energy, then sends its kits the drop as the member on the field collected it", () => {
    expect.hasAssertions();
    const energies: number[] = [];
    const onKitEvent = vi.fn<NonNullable<Kit["onKitEvent"]>>((_event, { party }) => {
      energies.push(getPartyMember(party, TRAVELER_CHARACTER_ID).energy);
    });
    const combatant: Combatant = {
      ascension: 0,
      attributes: computeCharacterAttributes([{ attribute: Attribute.EnergyRecharge, value: 1 }]),
      characterId: TRAVELER_CHARACTER_ID,
      constellationCount: 0,
      element: Element.Anemo,
      elementalResonances: [],
      kit: { ...TRAVELER_KIT, onKitEvent },
      level: 1,
    };
    const context = createKitTestContext(combatant);
    collectKitEnergyDrops(
      [{ count: 1, energyDropKind: EnergyDropKind.Particle, healthPercent: 0 }],
      Element.Anemo,
      context,
    );

    expect(onKitEvent).toHaveBeenCalledExactlyOnceWith(
      {
        characterId: TRAVELER_CHARACTER_ID,
        count: 1,
        element: Element.Anemo,
        energyDropKind: EnergyDropKind.Particle,
        kind: KitEventKind.EnergyParticleCollected,
      },
      context,
      combatant,
    );
    expect(energies).toStrictEqual([SAME_ELEMENT_PARTICLE_ENERGY]);
  });
});
