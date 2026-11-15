export const TilemapKey = {
  Home: "Home",
  HomeBuilding1: "HomeBuilding1",
  HomeBuilding2: "HomeBuilding2",
} as const;
export type TilemapKey = (typeof TilemapKey)[keyof typeof TilemapKey];
