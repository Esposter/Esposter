// The gradient lighting a quest's reward tile from its foot up, by its rarity in stars, as the quest screen draws it.
// Measured off the English client's quest screen, its three, four and five star tiles run bluer and deeper.
// That is bluer and deeper than the game's reward lists' (`ItemRarityFaceGradientMap`).
// A two star face is not measured, so it draws bare.
export const ItemRarityQuestFaceGradientMap: Readonly<Record<number, string>> = {
  3: "linear-gradient(#5a698f, #5482aa)",
  4: "linear-gradient(#666094, #8870b3)",
  5: "linear-gradient(#9e6a3c, #ba7831)",
};
