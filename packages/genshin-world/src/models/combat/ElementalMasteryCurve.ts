// How elemental mastery raises one kind of reaction: by scale × mastery / (mastery + offset)
export interface ElementalMasteryCurve {
  offset: number;
  scale: number;
}
