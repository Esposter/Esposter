import type { Interactable } from "#src/models/interaction/Interactable";
import type { Inventory } from "#src/models/inventory/Inventory";
import type { ShrineKeySource } from "#src/models/puzzle/ShrineKeySource";
import type { ShrineMarker } from "#src/models/puzzle/ShrineMarker";
import type { Ref } from "vue";

import { takeItemCounts } from "#src/services/inventory/takeItemCounts";
import { findShrineKeySource } from "#src/services/puzzle/findShrineKeySource";
import { openShrineOfDepths } from "#src/services/puzzle/openShrineOfDepths";
import { InteractionKind } from "genshin-interface";
import { GameTextKey } from "genshin-text";
import { computed } from "vue";

// Each shut shrine is offered on the ground beneath its point while the bag holds a key of its region. Opening it spends
// One such key from the bag and opens the shrine with it, and a shrine no key of its region is held for is offered nothing
export const useWorldShrines = ({
  gameText,
  getGroundHeight,
  inventory,
  setInventory,
  shrineKeySources,
  shrineMarkers,
}: {
  gameText: Readonly<Record<string, string>>;
  getGroundHeight: (x: number, z: number) => number;
  inventory: Ref<Inventory>;
  setInventory: (nextInventory: Inventory) => void;
  shrineKeySources: readonly ShrineKeySource[];
  shrineMarkers: readonly ShrineMarker[];
}) => {
  const shrineInteractables = computed<Interactable[]>(() =>
    shrineMarkers.flatMap(({ id, position: { x, z }, shrine }): Interactable[] => {
      if (shrine.isOpen || !findShrineKeySource(shrineKeySources, shrine.region, inventory.value.items)) return [];
      const name = gameText[GameTextKey.ShrineOfDepths] ?? "";
      return [{ id, kind: InteractionKind.Open, name, position: { x, y: getGroundHeight(x, z), z } }];
    }),
  );
  const openShrineById = (shrineId: string) => {
    const marker = shrineMarkers.find(({ id }) => id === shrineId);
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
