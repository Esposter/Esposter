// The Adventurer Handbook's Mora reward, a three star tile, and the four and five star tiles beside it
export const props = {
  count: 4000,
  rarity: 3,
  style: { height: "calc(var(--unit) * 88)", width: "calc(var(--unit) * 88)" },
};

export const variants = { five: { count: 150, rarity: 5 }, four: { count: 5, rarity: 4 } };
