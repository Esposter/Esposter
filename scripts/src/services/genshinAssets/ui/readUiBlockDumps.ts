import type { RectTransformDump } from "#src/models/genshinAssets/interface/RectTransformDump";
import type { DumpedGameObject } from "#src/models/genshinAssets/shared/DumpedGameObject";
import type { DumpedRectTransform } from "#src/models/genshinAssets/shared/DumpedRectTransform";
import type { UiBlockDumps } from "#src/models/genshinAssets/ui/UiBlockDumps";
import type { UiCanvasScaler } from "#src/models/genshinAssets/ui/UiCanvasScaler";
import type { UiRectTransformRead } from "#src/models/genshinAssets/ui/UiRectTransformRead";

import { parseRectTransformLayout } from "#src/services/genshinAssets/interface/parseRectTransformLayout";
import { reviveSourcePathId } from "#src/services/genshinAssets/shared/reviveSourcePathId";
import {
  UI_CANVAS_SCALER_NAME,
  UI_CANVAS_SCALER_RAW_DIRECTORY,
  UI_GAME_OBJECT_DIRECTORY,
  UI_RECT_TRANSFORM_DIRECTORY,
  UI_RECT_TRANSFORM_RAW_DIRECTORY,
} from "#src/services/genshinAssets/ui/constants";
import { decodeCanvasScaler } from "#src/services/genshinAssets/ui/decodeCanvasScaler";
import { getUiBaseName } from "#src/services/genshinAssets/ui/getUiBaseName";
import { readRawOwnerPathId } from "#src/services/genshinAssets/ui/readRawOwnerPathId";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation, settleAll } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// Files read at once: a block holds thousands of exports, and reading them all together would open them all together
const UI_READ_CONCURRENCY = 8;

// The containers an export folder holds, each with the names of its files, or none where the folder was never written
const listContainers = async (directory: string): Promise<{ container: string; files: string[] }[]> => {
  if (!existsSync(directory)) return [];
  return Promise.all(
    (await readdir(directory)).map(async (container) => ({
      container,
      files: await readdir(join(directory, container)),
    })),
  );
};

// A null pointer names no transform, and is written as the path ID `0`, which reads as no father
const toFatherId = (pathId: string): string => (pathId === "0" ? "" : pathId);

// The layouts of every container's raw RectTransforms, each keyed by its GameObject's path ID, the one their JSON dumps
// Name, so one pool reads them all rather than one pool per container
const readLayouts = async (rawDirectory: string): Promise<Map<string, Map<string, DumpedRectTransform>>> => {
  const raws = await settleAll(
    (await listContainers(rawDirectory)).flatMap(({ container, files }) =>
      files.map((file) => async () => ({ container, raw: await readFile(join(rawDirectory, container, file)) })),
    ),
    UI_READ_CONCURRENCY,
  );
  const layouts = new Map<string, Map<string, DumpedRectTransform>>();
  for (const { container, raw } of raws) {
    const containerLayouts = layouts.get(container) ?? new Map<string, DumpedRectTransform>();
    containerLayouts.set(readRawOwnerPathId(raw), parseRectTransformLayout(raw));
    layouts.set(container, containerLayouts);
  }
  return layouts;
};

const readGameObjects = async (directory: string): Promise<DumpedGameObject[]> => {
  const paths = (await listContainers(directory)).flatMap(({ container, files }) =>
    files.map((file) => join(directory, container, file)),
  );
  return settleAll(
    paths.map(
      (path) => async () => parseMachineJson<DumpedGameObject>(await readFile(path, "utf8"), reviveSourcePathId),
    ),
    UI_READ_CONCURRENCY,
  );
};

const readRectTransform = async (
  directory: string,
  container: string,
  file: string,
  layouts: ReadonlyMap<string, DumpedRectTransform>,
): Promise<UiRectTransformRead> => {
  const dump = parseMachineJson<RectTransformDump>(
    await readFile(join(directory, container, file), "utf8"),
    reviveSourcePathId,
  );
  const gameObjectId = dump.m_GameObject.m_PathID;
  const layout = layouts.get(gameObjectId);
  if (!layout) throw new InvalidOperationError(Operation.Read, join(directory, container, file), "has no raw layout");
  return {
    childIds: dump.m_Children.map(({ m_PathID }) => m_PathID),
    container,
    fatherId: toFatherId(dump.m_Father.m_PathID),
    gameObjectId,
    layout,
    name: dump.m_GameObject.Name,
    scale: [dump.m_LocalScale.X, dump.m_LocalScale.Y],
  };
};

// The layouts are read in their own pool before any JSON dump is, so each pool bounds the reads it runs at once
// Rather than two pools nesting, which would multiply the bound
const readRectTransforms = async (exportDirectory: string): Promise<UiRectTransformRead[]> => {
  const jsonDirectory = join(exportDirectory, UI_RECT_TRANSFORM_DIRECTORY);
  const layouts = await readLayouts(join(exportDirectory, UI_RECT_TRANSFORM_RAW_DIRECTORY));
  return settleAll(
    (await listContainers(jsonDirectory)).flatMap(({ container, files }) =>
      files.map(
        (file) => () =>
          readRectTransform(
            jsonDirectory,
            container,
            file,
            layouts.get(container) ?? new Map<string, DumpedRectTransform>(),
          ),
      ),
    ),
    UI_READ_CONCURRENCY,
  );
};

// The canvas scalers' settings by the path ID of the GameObject each holds, from the raw exports of the script.
// Each export is named for its scaler, under any duplicate suffix.
const readCanvases = async (directory: string): Promise<Map<string, UiCanvasScaler>> => {
  const scalerPaths = (await listContainers(directory)).flatMap(({ container, files }) =>
    files
      .filter((file) => getUiBaseName(file.replace(/\.dat$/u, "")) === UI_CANVAS_SCALER_NAME)
      .map((file) => join(directory, container, file)),
  );
  const raws = await settleAll(
    scalerPaths.map((path) => () => readFile(path)),
    UI_READ_CONCURRENCY,
  );
  return new Map(raws.map((raw): [string, UiCanvasScaler] => [readRawOwnerPathId(raw), decodeCanvasScaler(raw)]));
};

// A block's UI export read into the dumps the index joins, a folder at a time
// Each folder's pool runs to completion before the next starts, so UI_READ_CONCURRENCY bounds the whole block
export const readUiBlockDumps = async (exportDirectory: string): Promise<UiBlockDumps> => {
  const canvases = await readCanvases(join(exportDirectory, UI_CANVAS_SCALER_RAW_DIRECTORY));
  const gameObjects = await readGameObjects(join(exportDirectory, UI_GAME_OBJECT_DIRECTORY));
  const rectTransforms = await readRectTransforms(exportDirectory);
  return { canvases, gameObjects, rectTransforms };
};
