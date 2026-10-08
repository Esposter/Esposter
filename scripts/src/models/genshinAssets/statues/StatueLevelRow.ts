// One level of a region's statues as the world reads it: the Oculi it takes, the item they are, the rewards it pays
// Beyond the Adventure EXP and Primogems every region shares, and the stamina it adds to the maximum
export interface StatueLevelRow {
  level: number;
  oculusCount: number;
  oculusItemId: number;
  rewards: { itemCount: number; itemId: number }[];
  staminaShare: number;
}
