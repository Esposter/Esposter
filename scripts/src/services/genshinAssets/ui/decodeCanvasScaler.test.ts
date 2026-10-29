import { ScreenMatchMode } from "#src/models/genshinAssets/ui/ScreenMatchMode";
import { UiScaleMode } from "#src/models/genshinAssets/ui/UiScaleMode";
import {
  CANVAS_SCALER_MATCH_WIDTH_OR_HEIGHT_OFFSET,
  CANVAS_SCALER_REFERENCE_HEIGHT_OFFSET,
  CANVAS_SCALER_REFERENCE_WIDTH_OFFSET,
  CANVAS_SCALER_SCREEN_MATCH_MODE_OFFSET,
  CANVAS_SCALER_SETTINGS_BYTES,
  CANVAS_SCALER_UI_SCALE_MODE_OFFSET,
} from "#src/services/genshinAssets/ui/constants";
import { decodeCanvasScaler } from "#src/services/genshinAssets/ui/decodeCanvasScaler";
import { describe, expect, test } from "vitest";

describe(decodeCanvasScaler, () => {
  test("reads the settings that end a raw export, past whatever precedes them", () => {
    expect.hasAssertions();

    const LEADING_BYTES = 32;
    const raw = Buffer.alloc(LEADING_BYTES + CANVAS_SCALER_SETTINGS_BYTES);
    const start = raw.length - CANVAS_SCALER_SETTINGS_BYTES;
    raw.writeInt32LE(1, start + CANVAS_SCALER_UI_SCALE_MODE_OFFSET);
    raw.writeFloatLE(1920, start + CANVAS_SCALER_REFERENCE_WIDTH_OFFSET);
    raw.writeFloatLE(1080, start + CANVAS_SCALER_REFERENCE_HEIGHT_OFFSET);
    raw.writeInt32LE(0, start + CANVAS_SCALER_SCREEN_MATCH_MODE_OFFSET);
    raw.writeFloatLE(0.5, start + CANVAS_SCALER_MATCH_WIDTH_OR_HEIGHT_OFFSET);

    expect(decodeCanvasScaler(raw)).toStrictEqual({
      matchWidthOrHeight: 0.5,
      referenceResolution: [1920, 1080],
      screenMatchMode: ScreenMatchMode.MatchWidthOrHeight,
      uiScaleMode: UiScaleMode.ScaleWithScreenSize,
    });
  });
});
