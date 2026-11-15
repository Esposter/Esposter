import type { CurveWrapMode } from "#src/models/genshinAssets/scene/CurveWrapMode";
import type { GradientMode } from "#src/models/genshinAssets/scene/GradientMode";
import type { SerializedFieldKind } from "#src/models/genshinAssets/scene/SerializedFieldKind";
import type { ObjectPointer } from "#src/models/genshinAssets/shared/ObjectPointer";

// One field of a script's raw bytes as its shape reads, at its byte offset from the start of the export
export type SerializedField = (
  | {
      alphaKeys: { alpha: number; time: number }[];
      colorKeys: { color: [number, number, number]; time: number }[];
      kind: typeof SerializedFieldKind.Gradient;
      mode: GradientMode;
    }
  | { color: [number, number, number, number]; kind: typeof SerializedFieldKind.Color }
  | { elements: SerializedField[]; kind: typeof SerializedFieldKind.Array }
  | {
      keys: { inSlope: number; outSlope: number; time: number; value: number }[];
      kind: typeof SerializedFieldKind.Curve;
      postWrap: CurveWrapMode;
      preWrap: CurveWrapMode;
    }
  | { kind: typeof SerializedFieldKind.Float | typeof SerializedFieldKind.Integer; value: number }
  | { kind: typeof SerializedFieldKind.Pointer; pointer: ObjectPointer }
) & { offset: number };
