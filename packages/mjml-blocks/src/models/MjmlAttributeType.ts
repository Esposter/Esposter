import type { MjmlAttributeKind } from "#src/models/MjmlAttributeKind";

export type MjmlAttributeType =
  | {
      isNegativeAllowed: boolean;
      kind: typeof MjmlAttributeKind.Unit;
      maxCount: number;
      minCount: number;
      units: string[];
    }
  | { kind: typeof MjmlAttributeKind.Boolean }
  | { kind: typeof MjmlAttributeKind.Color }
  | { kind: typeof MjmlAttributeKind.Enum; options: string[] }
  | { kind: typeof MjmlAttributeKind.Integer }
  | { kind: typeof MjmlAttributeKind.String };
