// A fitted waterfall as the region data holds it: the lip's centre, the unit direction across it, the width and the
// Drop, its points as plain x, y and z in metres
export interface WaterfallSheetRecord {
  across: { x: number; y: number; z: number };
  drop: number;
  lip: { x: number; y: number; z: number };
  width: number;
}
