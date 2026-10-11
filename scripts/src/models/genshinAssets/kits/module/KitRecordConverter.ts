import type { AttackArea, KitAction, KitActionRecord, KitHit, KitHitRecord, KitParameter } from "genshin-world";

// Converts a kit module's values to its record's, each given its twin from the build of encoded multipliers
export interface KitRecordConverter {
  toAction: (action: KitAction, encodedAction: KitAction | undefined) => KitActionRecord;
  toActionFields: (
    action: Partial<KitAction>,
    encodedAction: Partial<KitAction> | undefined,
  ) => Partial<KitActionRecord>;
  toArea: (area: AttackArea) => AttackArea;
  toFrames: (seconds: number) => number;
  toHit: (hit: KitHit, encodedHit: KitHit | undefined) => KitHitRecord;
  toHitFields: (hit: Partial<KitHit>, encodedHit: Partial<KitHit> | undefined) => Partial<KitHitRecord>;
  toParameter: (value: number, encodedValue: unknown) => KitParameter;
}
