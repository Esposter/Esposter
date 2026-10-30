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

// The layouts of one container's raw RectTransforms by their GameObject's path ID, the one their JSON dumps name
const readLayouts = async (directory: string): Promise<Map<string, DumpedRectTransform>> => {
  const layouts = new Map<string, DumpedRectTransform>();
  if (!existsSync(directory)) return layouts;
  const raws = await settleAll(
    (await readdir(directory)).map((file) => () => readFile(join(directory, file))),
    UI_READ_CONCURRENCY,
  );
  for (const raw of raws) layouts.set(readRawOwnerPathId(raw), parseRectTransformLayout(raw));
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

const readContainerRectTransforms = async (
  jsonDirectory: string,
  rawDirectory: string,
  container: string,
  files: string[],
): Promise<UiRectTransformRead[]> => {
  const layouts = await readLayouts(join(rawDirectory, container));
  return settleAll(
    files.map((file) => () => readRectTransform(jsonDirectory, container, file, layouts)),
    UI_READ_CONCURRENCY,
  );
};

const readRectTransforms = async (exportDirectory: string): Promise<UiRectTransformRead[]> => {
  const jsonDirectory = join(exportDirectory, UI_RECT_TRANSFORM_DIRECTORY);
  const rawDirectory = join(exportDirectory, UI_RECT_TRANSFORM_RAW_DIRECTORY);
  const containerRectTransforms = await settleAll(
    (await listContainers(jsonDirectory)).map(
      ({ container, files }) =>
        () =>
          readContainerRectTransforms(jsonDirectory, rawDirectory, container, files),
    ),
    UI_READ_CONCURRENCY,
  );
  return containerRectTransforms.flat();
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
export const readUiBlockDumps = async (exportDirectory: string): Promise<UiBlockDumps> => {
  const [canvases, gameObjects, rectTransforms] = await Promise.all([
    readCanvases(join(exportDirectory, UI_CANVAS_SCALER_RAW_DIRECTORY)),
    readGameObjects(join(exportDirectory, UI_GAME_OBJECT_DIRECTORY)),
    readRectTransforms(exportDirectory),
  ]);
  return { canvases, gameObjects, rectTransforms };
};
