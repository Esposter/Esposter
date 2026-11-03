import type { Interactable } from "#src/models/interaction/Interactable";
import type { ShrineKeySource } from "#src/models/puzzle/ShrineKeySource";

import { takeItemCounts } from "#src/services/inventory/takeItemCounts";
import { findShrineKeySource } from "#src/services/puzzle/findShrineKeySource";
import { openShrineOfDepths } from "#src/services/puzzle/openShrineOfDepths";
import { useWorldGroundStore } from "#src/store/ground";
import { useWorldPuzzlesStore } from "#src/store/puzzles";
import { useWorldSessionStore } from "#src/store/session";
import { InteractionKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";
import { storeToRefs } from "pinia";
import { computed } from "vue";

// Each shut shrine is offered on the ground beneath its point while the bag holds a key of its region. Opening it spends
// One such key from the bag and opens the shrine with it, and a shrine no key of its region is held for is offered nothing
export const useWorldShrines = ({ shrineKeySources }: { shrineKeySources: readonly ShrineKeySource[] }) => {
  const worldPuzzlesStore = useWorldPuzzlesStore();
  const { shrineMarkers } = storeToRefs(worldPuzzlesStore);
  const worldGroundStore = useWorldGroundStore();
  const { getGroundHeight } = worldGroundStore;
  const worldSessionStore = useWorldSessionStore();
  const { inventory } = storeToRefs(worldSessionStore);
  const { setInventory } = worldSessionStore;
  const shrineInteractables = computed<Interactable[]>(() =>
    shrineMarkers.value.flatMap(({ id, position: { x, z }, shrine }): Interactable[] => {
      if (shrine.isOpen || !findShrineKeySource(shrineKeySources, shrine.region, inventory.value.items)) return [];
      const name = worldSessionStore.gameText[GameTextKey.ShrineOfDepths] ?? "";
      return [{ id, kind: InteractionKind.Open, name, position: { x, y: getGroundHeight(x, z), z } }];
    }),
  );
  const openShrineById = (shrineId: string) => {
    const marker = shrineMarkers.value.find(({ id }) => id === shrineId);
    if (!marker || marker.shrine.isOpen) return;
    const keySource = findShrineKeySource(shrineKeySources, marker.shrine.region, inventory.value.items);
    if (!keySource) return;
    setInventory({
      ...inventory.value,
      items: takeItemCounts(inventory.value.items, [{ count: 1, id: keySource.keyItemId }], 1),
    });
    openShrineOfDepths(marker.shrine, keySource.keyRegion);
  };
  return { openShrineById, shrineInteractables };
};
