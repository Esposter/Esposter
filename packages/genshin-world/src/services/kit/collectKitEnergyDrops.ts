import type { Element } from "#src/models/Element";
import type { EnergyDrop } from "#src/models/enemy/EnergyDrop";
import type { KitStrikeContext } from "#src/models/kit/KitStrikeContext";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { gainPartyEnergy } from "#src/services/party/gainPartyEnergy";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";

// The energy an enemy dropped, of an element or of none, collected by the member on the field: each drop is written into
// The deployed team's energy, then sent to its kits, as gcsim's particles are distributed before they are announced
export const collectKitEnergyDrops = (
  energyDrops: readonly EnergyDrop[],
  element: Element | undefined,
  { characterIdCombatantMap, emit, party }: Pick<KitStrikeContext, "characterIdCombatantMap" | "emit" | "party">,
): void => {
  const characterId = getActiveCharacterId(party);
  for (const energyDrop of energyDrops) {
    gainPartyEnergy(party, energyDrop, element, characterIdCombatantMap);
    const { count, energyDropKind } = energyDrop;
    emit({ characterId, count, element, energyDropKind, kind: KitEventKind.EnergyParticleCollected });
  }
};
