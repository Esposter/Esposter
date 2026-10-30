import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { AnimeStudioGroupType } from "#src/models/genshinAssets/shared/AnimeStudioGroupType";
import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { GENSHIN_ANIMESTUDIO_OPTIONS } from "#src/services/genshinAssets/shared/constants";
import {
  UI_CANVAS_SCALER_NAME_PATTERN,
  UI_CANVAS_SCALER_RAW_DIRECTORY,
  UI_GAME_OBJECT_DIRECTORY,
  UI_RECT_TRANSFORM_DIRECTORY,
  UI_RECT_TRANSFORM_RAW_DIRECTORY,
} from "#src/services/genshinAssets/ui/constants";
import { runAnimeStudio } from "#src/services/recreation/animeStudio/runAnimeStudio";
import { join } from "node:path";

// One AnimeStudio run of a block's UI into its folder, grouped by container: a run per type, since a folder holds one
// type's objects, and a run's objects are named by their own names. Its options are the arguments a type takes
const runUiExport = (blockPath: string, directory: string, args: string[]): void =>
  runAnimeStudio(
    [blockPath, directory, ...args, "--group_assets", AnimeStudioGroupType.ByContainer],
    GENSHIN_ANIMESTUDIO_OPTIONS,
  );

// A block's UI as AnimeStudio exports it, each folder grouped by container (a prefab, or the type a container-less object
// is grouped under): its GameObjects and RectTransforms as JSON, its RectTransforms raw for their layout, and the canvas
// scalers' raw exports, the only MonoBehaviours it names. Nothing else of the block is exported
export const exportUiBlock = (blockPath: string, directory: string): void => {
  runUiExport(blockPath, join(directory, UI_GAME_OBJECT_DIRECTORY), [
    "--types",
    AssetType.GameObject,
    "--export_type",
    AnimeStudioExportType.Json,
  ]);
  runUiExport(blockPath, join(directory, UI_RECT_TRANSFORM_DIRECTORY), [
    "--types",
    AssetType.RectTransform,
    "--export_type",
    AnimeStudioExportType.Json,
  ]);
  runUiExport(blockPath, join(directory, UI_RECT_TRANSFORM_RAW_DIRECTORY), [
    "--types",
    AssetType.RectTransform,
    "--export_type",
    AnimeStudioExportType.Raw,
  ]);
  runUiExport(blockPath, join(directory, UI_CANVAS_SCALER_RAW_DIRECTORY), [
    "--types",
    AssetType.MonoBehaviour,
    "--names",
    UI_CANVAS_SCALER_NAME_PATTERN,
    "--export_type",
    AnimeStudioExportType.Raw,
  ]);
};
