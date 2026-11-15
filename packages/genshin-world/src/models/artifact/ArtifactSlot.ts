// The five pieces a character wears one of each of, each spelt as the game's tables spell it
export const ArtifactSlot = {
  CircletOfLogos: "EQUIP_DRESS",
  FlowerOfLife: "EQUIP_BRACER",
  GobletOfEonothem: "EQUIP_RING",
  PlumeOfDeath: "EQUIP_NECKLACE",
  SandsOfEon: "EQUIP_SHOES",
} as const;
export type ArtifactSlot = (typeof ArtifactSlot)[keyof typeof ArtifactSlot];
