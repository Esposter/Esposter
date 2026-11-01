// The gradient that lights a quest's reward tile from its foot up, by its rarity in stars, as the quest screen's rewards
// Draw it. Measured off the English client's quest screen, where its three, four and five star tiles run bluer and
// Deeper than the game's reward lists' (`ItemRarityFaceGradientMap`). A two star face is not measured, so it draws bare.
export const ItemRarityQuestFaceGradientMap: Readonly<Record<number, string>> = {
  3: "linear-gradient(#5a698f, #5482aa)",
  4: "linear-gradient(#666094, #8870b3)",
  5: "linear-gradient(#9e6a3c, #ba7831)",
};
