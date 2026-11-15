// The icons a tower buff row names its Benediction's card by, the game's own texture names
export const TowerBuffIcon = {
  Attack: "UI_Icon_TowerbeginCard_Attack",
  Defense: "UI_Icon_TowerbeginCard_Defense",
  Life: "UI_Icon_TowerbeginCard_Life",
} as const;
export type TowerBuffIcon = (typeof TowerBuffIcon)[keyof typeof TowerBuffIcon];
