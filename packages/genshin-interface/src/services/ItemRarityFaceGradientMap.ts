// The gradient that lights an item's face from its foot up, by its rarity in stars.
// The item tile draws it, and so does the Archive's tile for a four or five star weapon.
// The two star face is provisional: no reward list in a still shows a two star tile, so its stops are the bag cell's
// Two star face in the inventory still, lifted by the offset the bag cell's three star face shows against the reward
// Tile's three star stops (the offsets measured at the same four heights, from 0% to 77%).
// Zero and one share the grey one star face: the materials table gives an expedition's exchange items no stars.
// Yet the game draws them as one
const ONE_STAR_FACE = "linear-gradient(#7e7e7d, #838383 30%, #909090 60%, #909090 77%)";

export const ItemRarityFaceGradientMap: Readonly<Record<number, string>> = {
  0: ONE_STAR_FACE,
  1: ONE_STAR_FACE,
  2: "linear-gradient(#769581, #6e9784 30%, #6e9b82 60%, #73a48a 77%)",
  3: "linear-gradient(#79809d, #7485a6 30%, #748faf 60%, #7298b9 77%)",
  4: "linear-gradient(#7e77a2, #877aac 30%, #917db4 60%, #9c80bc 77%)",
  5: "linear-gradient(#b0804c, #ba8446 30%, #c38946 60%, #cc8d43 77%)",
};
