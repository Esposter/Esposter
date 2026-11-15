// The lasting types a tower buff row names its Benediction by, the game's own spellings
export const TowerBuffLastingType = {
  Floor: "TOWER_BUFF_LASTING_FLOOR",
  Immediate: "TOWER_BUFF_LASTING_IMMEDIATE",
  Level: "TOWER_BUFF_LASTING_LEVEL",
} as const;
export type TowerBuffLastingType = (typeof TowerBuffLastingType)[keyof typeof TowerBuffLastingType];
