import type { GridItem } from "@/models/dashboard/GridItem";

// Two cells share a column and a row. An item never collides with itself, and cells that only touch an edge do not
export const checkIsColliding = (item: GridItem, other: GridItem) =>
  item.id !== other.id &&
  item.x < other.x + other.w &&
  item.x + item.w > other.x &&
  item.y < other.y + other.h &&
  item.y + item.h > other.y;
