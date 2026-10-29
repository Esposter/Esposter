import type { RectTransformDump } from "#src/models/genshinAssets/interface/RectTransformDump";
import type { DumpedGameObject } from "#src/models/genshinAssets/shared/DumpedGameObject";
import type { DumpedRectTransform } from "#src/models/genshinAssets/shared/DumpedRectTransform";
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
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// What a block's UI export holds, read a folder at a time: its GameObjects, its RectTransforms joined to their layouts,
// and the canvas scalers by their GameObject's path ID
export interface UiBlockDumps {
  canvases: Map<string, UiCanvasScaler>;
  gameObjects: DumpedGameObject[];
  rectTransforms: UiRectTransformRead[];
}

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
  for (const file of await readdir(directory)) {
    const raw = await readFile(join(directory, file));
    layouts.set(readRawOwnerPathId(raw), parseRectTransformLayout(raw));
  }
  return layouts;
};

const readGameObjects = async (directory: string): Promise<DumpedGameObject[]> => {
  const gameObjects: DumpedGameObject[] = [];
  for (const { container, files } of await listContainers(directory))
    for (const file of files)
      gameObjects.push(
        parseMachineJson<DumpedGameObject>(
          await readFile(join(directory, container, file), "utf8"),
          reviveSourcePathId,
        ),
      );
  return gameObjects;
};

const readRectTransforms = async (exportDirectory: string): Promise<UiRectTransformRead[]> => {
  const rectTransforms: UiRectTransformRead[] = [];
  const jsonDirectory = join(exportDirectory, UI_RECT_TRANSFORM_DIRECTORY);
  const rawDirectory = join(exportDirectory, UI_RECT_TRANSFORM_RAW_DIRECTORY);
  for (const { container, files } of await listContainers(jsonDirectory)) {
    const layouts = await readLayouts(join(rawDirectory, container));
    for (const file of files) {
      const dump = parseMachineJson<RectTransformDump>(
        await readFile(join(jsonDirectory, container, file), "utf8"),
        reviveSourcePathId,
      );
      const gameObjectId = dump.m_GameObject.m_PathID;
      const layout = layouts.get(gameObjectId);
      if (!layout)
        throw new InvalidOperationError(Operation.Read, join(jsonDirectory, container, file), "has no raw layout");
      rectTransforms.push({
        childIds: dump.m_Children.map(({ m_PathID }) => m_PathID),
        container,
        fatherId: toFatherId(dump.m_Father.m_PathID),
        gameObjectId,
        layout,
        name: dump.m_GameObject.Name,
        scale: [dump.m_LocalScale.X, dump.m_LocalScale.Y],
      });
    }
  }
  return rectTransforms;
};

// The canvas scalers' settings by the path ID of the GameObject each holds, from the raw exports of the script, the
// export's name for a scaler under any duplicate suffix
const readCanvases = async (directory: string): Promise<Map<string, UiCanvasScaler>> => {
  const canvases = new Map<string, UiCanvasScaler>();
  for (const { container, files } of await listContainers(directory))
    for (const file of files) {
      if (getUiBaseName(file.replace(/\.dat$/u, "")) !== UI_CANVAS_SCALER_NAME) continue;
      const raw = await readFile(join(directory, container, file));
      canvases.set(readRawOwnerPathId(raw), decodeCanvasScaler(raw));
    }
  return canvases;
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
