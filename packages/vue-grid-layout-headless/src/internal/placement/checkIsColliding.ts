import type { GridBlock } from "#src/models/GridBlock";
import type { GridCell } from "#src/models/GridCell";

// Two items collide when they share a cell, and an item never collides with itself, nor with one that only touches its
// Edge. A cell with no id is no item, so it collides with every item it shares a cell with
export const checkIsColliding = (item: { id?: string } & GridCell, other: GridBlock): boolean =>
  item.id !== other.id &&
  item.x < other.x + other.w &&
  item.x + item.w > other.x &&
  item.y < other.y + other.h &&
  item.y + item.h > other.y;
