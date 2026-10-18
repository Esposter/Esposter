import type { Element } from "#src/models/Element";
import type { EnergyDrop } from "#src/models/enemy/EnergyDrop";
import type { KitContext } from "#src/models/kit/KitContext";
import type { ParticleDrop } from "#src/models/party/ParticleDrop";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { gainPartyEnergy } from "#src/services/party/gainPartyEnergy";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";

// The energy an enemy dropped, of an element or of none, collected by the member on the field: each drop is written into
// The deployed team's energy, then sent to its kits, as gcsim's particles are distributed before they are announced
export const collectKitEnergyDrops = (
  energyDrops: readonly (EnergyDrop | ParticleDrop)[],
  element: Element | undefined,
  context: KitContext,
): void => {
  const { characterIdCombatantMap, party } = context;
  const characterId = getActiveCharacterId(party);
  for (const energyDrop of energyDrops) {
    const dropElement = "element" in energyDrop ? energyDrop.element : element;
    gainPartyEnergy(party, energyDrop, dropElement, characterIdCombatantMap);
    const { count, energyDropKind } = energyDrop;
    emitKitEvent(
      { characterId, count, element: dropElement, energyDropKind, kind: KitEventKind.EnergyParticleCollected },
      context,
    );
  }
};
