import type { SerializedFieldKind } from "#src/models/genshinAssets/scene/SerializedFieldKind";
import type { ObjectPointer } from "#src/models/genshinAssets/shared/ObjectPointer";

// One field of a script's raw bytes as its shape reads, at its byte offset from the start of the export
export type SerializedField = (
  | {
      alphaKeys: { alpha: number; time: number }[];
      colorKeys: { color: [number, number, number]; time: number }[];
      kind: SerializedFieldKind.Gradient;
    }
  | { color: Color; kind: SerializedFieldKind.Color }
  | { elements: SerializedField[]; kind: SerializedFieldKind.Array }
  | { keys: { inSlope: number; outSlope: number; time: number; value: number }[]; kind: SerializedFieldKind.Curve }
  | { kind: SerializedFieldKind.Float | SerializedFieldKind.Integer; value: number }
  | { kind: SerializedFieldKind.Pointer; pointer: ObjectPointer }
) & { offset: number };
type Color = [number, number, number, number];
