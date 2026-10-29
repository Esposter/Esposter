import { ScreenMatchMode } from "#src/models/genshinAssets/ui/ScreenMatchMode";
import { UiScaleMode } from "#src/models/genshinAssets/ui/UiScaleMode";
import { PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { join } from "node:path";

// The UI index, kept beside the game's exports and never in the repository: one JSON lines file per block, and the
// manifest holding each block's content hash and entry count
export const UI_INDEX_DIRECTORY: string = join(PARITY_DIRECTORY, "ui-index");
export const UI_INDEX_MANIFEST_PATH: string = join(UI_INDEX_DIRECTORY, "manifest.json");
// The AnimeStudio exports a block's index is read from, kept only while the block is read: a folder per export, each
// grouped by container
export const UI_INDEX_EXPORT_DIRECTORY: string = join(UI_INDEX_DIRECTORY, "exports");
export const UI_GAME_OBJECT_DIRECTORY = "gameObject";
export const UI_RECT_TRANSFORM_DIRECTORY = "rectTransform";
export const UI_RECT_TRANSFORM_RAW_DIRECTORY = "rectTransformRaw";
export const UI_CANVAS_SCALER_RAW_DIRECTORY = "canvasScalerRaw";
// The suffix AnimeStudio gives a second object of a name in one folder ("Fog_09 (1)"), taken off to find an object by
// the name it was made with
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation this pattern would otherwise infer
export const UI_DUPLICATE_SUFFIX_REGEX: RegExp = / \(\d+\)$/u;
// The name of the scaler a canvas holds, and the pattern an export names only that script by
export const UI_CANVAS_SCALER_NAME = "CanvasScaler";
// oxlint-disable-next-line typescript/no-inferrable-types -- `isolatedDeclarations` demands the annotation a template literal would otherwise infer
export const UI_CANVAS_SCALER_NAME_PATTERN: string = `^${UI_CANVAS_SCALER_NAME}$`;
// Where a raw export's owner is, at the start of every component's: a pointer's 32-bit file ID, then its 64-bit path ID
export const RAW_OWNER_PATH_ID_OFFSET = 4;
// A canvas scaler's raw export ends with its settings, 44 bytes whose offsets run from the start of those settings: its
// mode, the two floats between the mode and its reference resolution (not read), the resolution's width and height, its
// screen match mode, its width-or-height weight and its physical unit with the DPIs after (not read)
export const CANVAS_SCALER_SETTINGS_BYTES = 44;
export const CANVAS_SCALER_UI_SCALE_MODE_OFFSET = 0;
export const CANVAS_SCALER_REFERENCE_WIDTH_OFFSET = 12;
export const CANVAS_SCALER_REFERENCE_HEIGHT_OFFSET = 16;
export const CANVAS_SCALER_SCREEN_MATCH_MODE_OFFSET = 20;
export const CANVAS_SCALER_MATCH_WIDTH_OR_HEIGHT_OFFSET = 24;
// The modes in the order Unity numbers them, so an int read from a scaler indexes the mode it names
export const UI_SCALE_MODES: readonly UiScaleMode[] = [
  UiScaleMode.ConstantPixelSize,
  UiScaleMode.ScaleWithScreenSize,
  UiScaleMode.ConstantPhysicalSize,
];
export const SCREEN_MATCH_MODES: readonly ScreenMatchMode[] = [
  ScreenMatchMode.MatchWidthOrHeight,
  ScreenMatchMode.Expand,
  ScreenMatchMode.Shrink,
];
