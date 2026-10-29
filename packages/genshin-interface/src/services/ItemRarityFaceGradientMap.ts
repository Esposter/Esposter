// The gradient that lights an item's face from its foot up, by its rarity in stars: the item tile draws it, and so does
// the Archive's tile for a four or five star weapon. A two star face is not measured yet, so it has no entry and draws bare
export const ItemRarityFaceGradientMap: Readonly<Record<number, string>> = {
  3: "linear-gradient(#79809d, #7485a6 30%, #748faf 60%, #7298b9 77%)",
  4: "linear-gradient(#7e77a2, #877aac 30%, #917db4 60%, #9c80bc 77%)",
  5: "linear-gradient(#b0804c, #ba8446 30%, #c38946 60%, #cc8d43 77%)",
};
