import type { UiCanvasScaler } from "#src/models/genshinAssets/ui/UiCanvasScaler";

import {
  CANVAS_SCALER_MATCH_WIDTH_OR_HEIGHT_OFFSET,
  CANVAS_SCALER_REFERENCE_HEIGHT_OFFSET,
  CANVAS_SCALER_REFERENCE_WIDTH_OFFSET,
  CANVAS_SCALER_SCREEN_MATCH_MODE_OFFSET,
  CANVAS_SCALER_SETTINGS_BYTES,
  CANVAS_SCALER_UI_SCALE_MODE_OFFSET,
  SCREEN_MATCH_MODES,
  UI_SCALE_MODES,
} from "#src/services/genshinAssets/ui/constants";
import { takeOne } from "@esposter/shared";

// A canvas scaler's settings from its raw export, read from the settings that end it. Its modes are the ints the
// Game's scalers hold, indexed into the modes Unity numbers
export const decodeCanvasScaler = (raw: Buffer): UiCanvasScaler => {
  const start = raw.length - CANVAS_SCALER_SETTINGS_BYTES;
  return {
    matchWidthOrHeight: raw.readFloatLE(start + CANVAS_SCALER_MATCH_WIDTH_OR_HEIGHT_OFFSET),
    referenceResolution: [
      raw.readFloatLE(start + CANVAS_SCALER_REFERENCE_WIDTH_OFFSET),
      raw.readFloatLE(start + CANVAS_SCALER_REFERENCE_HEIGHT_OFFSET),
    ],
    screenMatchMode: takeOne(SCREEN_MATCH_MODES, raw.readInt32LE(start + CANVAS_SCALER_SCREEN_MATCH_MODE_OFFSET)),
    uiScaleMode: takeOne(UI_SCALE_MODES, raw.readInt32LE(start + CANVAS_SCALER_UI_SCALE_MODE_OFFSET)),
  };
};
