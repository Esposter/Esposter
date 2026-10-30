import type { ScreenMatchMode } from "#src/models/genshinAssets/ui/ScreenMatchMode";
import type { UiScaleMode } from "#src/models/genshinAssets/ui/UiScaleMode";

// A canvas scaler's settings as its MonoBehaviour's raw export holds them: how it sizes the canvas.
// Its reference resolution is in canvas units.
// The screen's aspect is matched to that resolution by the weight of width against height.
export interface UiCanvasScaler {
  matchWidthOrHeight: number;
  referenceResolution: [number, number];
  screenMatchMode: ScreenMatchMode;
  uiScaleMode: UiScaleMode;
}
