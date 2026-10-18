import type { GridItem } from "#src/models/GridItem";

// Two items collide when they share a cell, and an item never collides with itself, nor with one that only touches its edge
export const checkIsColliding = (item: GridItem, other: GridItem): boolean =>
  item.id !== other.id &&
  item.x < other.x + other.w &&
  item.x + item.w > other.x &&
  item.y < other.y + other.h &&
  item.y + item.h > other.y;
