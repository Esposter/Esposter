import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { WorldDrop } from "#src/models/world/WorldDrop";

import { ID_SEPARATOR } from "@esposter/shared";

// Where the items one source drops lie, an enemy that fell, an ore that broke or an offering whose rewards the bag had no
// Room for: each a drop of its own at the source's ground point, numbered from the drops the page has placed so far, so
// No two drops of the page share an id. A drop keeps the artifact it rolled, so the artifact is the one picked up
export const placeDroppedItems = (
  { id, position }: Pick<WorldDrop, "id" | "position">,
  droppedItems: DroppedItem[],
  placedDropCount: number,
): WorldDrop[] =>
  droppedItems.map((droppedItem, index) => ({
    ...droppedItem,
    id: [id, placedDropCount + index].join(ID_SEPARATOR),
    position: { x: position.x, z: position.z },
  }));
