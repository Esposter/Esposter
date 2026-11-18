// The Adventurer Handbook's Mora reward, a three star tile, and the four and five star tiles beside it
export const props = {
  count: 4000,
  rarity: 3,
  style: { height: "calc(var(--unit) * 88)", width: "calc(var(--unit) * 88)" },
};

// A four-point star stands for a traced icon, which the game's art is not shipped as: it lies in the tile's 100 unit square
const ICON_SHAPE = "M50 6 L61 39 L94 50 L61 61 L50 94 L39 61 L6 50 L39 39 Z";

export const variants = {
  bare: { count: "4~5", rarity: 3 },
  five: { count: 150, rarity: 5 },
  four: { count: 5, rarity: 4 },
  icon: { icon: ICON_SHAPE },
};
