import { MjmlAttributeKind } from "#src/models/MjmlAttributeKind";

export type MjmlAttributeType =
  | { allowsNegative: boolean; kind: MjmlAttributeKind.Unit; maxCount: number; minCount: number; units: string[] }
  | { kind: MjmlAttributeKind.Boolean }
  | { kind: MjmlAttributeKind.Color }
  | { kind: MjmlAttributeKind.Enum; options: string[] }
  | { kind: MjmlAttributeKind.Integer }
  | { kind: MjmlAttributeKind.String };
