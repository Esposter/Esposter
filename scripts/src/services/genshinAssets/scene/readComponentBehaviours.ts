import type { ComponentBehaviour } from "#src/models/genshinAssets/scene/ComponentBehaviour";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { ObjectPointer } from "#src/models/genshinAssets/shared/ObjectPointer";

import { AnimeStudioExportType } from "#src/models/genshinAssets/shared/AnimeStudioExportType";
import { scanSerializedFields } from "#src/services/genshinAssets/scene/scanSerializedFields";
import { CAB_MAP_PATH } from "#src/services/genshinAssets/shared/constants";
import { exportBlockBySource } from "#src/services/genshinAssets/shared/exportBlockBySource";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { parseCabMap } from "#src/services/genshinAssets/shared/parseCabMap";
import { readIndexedAssets } from "#src/services/genshinAssets/shared/readIndexedAssets";
import { readSceneLayout } from "#src/services/genshinAssets/shared/readSceneLayout";
import { resolveObjectPointer } from "#src/services/genshinAssets/shared/resolveObjectPointer";
import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";
import { existsSync } from "node:fs";
import { readdir, readFile, rm } from "node:fs/promises";
import { basename, join } from "node:path";

const BEHAVIOUR_TYPE = "MonoBehaviour";
// Every MonoBehaviour of a component's layout blocks exported raw, per file, and scanned for the shapes its fields take
// (`scanSerializedFields`), each pointer resolved through its file's external references and named by what the layout
// Or the asset index holds there. A pointer only counts where one of them holds its target, so a float's bits are never
// Read as one. Only the scripts whose names match are returned when a pattern is given
export const readComponentBehaviours = async (
  component: DerivedAssetComponent,
  scriptPattern?: RegExp,
): Promise<ComponentBehaviour[]> => {
  const directory = getComponentDirectory(component);
  const [cabMapBytes, { objectNameMap }] = await Promise.all([
    readFile(CAB_MAP_PATH),
    readSceneLayout(directory.layout),
  ]);
  const cabMap = parseCabMap(cabMapBytes);
  const layoutFiles = new Set(
    (await readdir(directory.layout, { recursive: true, withFileTypes: true }))
      .filter((entry) => entry.isDirectory() && cabMap.has(entry.name))
      .map(({ name }) => name),
  );
  const blocks = new Set([...layoutFiles].flatMap((file) => cabMap.get(file)?.block ?? []));
  await rm(directory.behaviours, { force: true, recursive: true });
  for (const block of blocks)
    // oxlint-disable-next-line no-await-in-loop -- AnimeStudio reads one block at a time
    await exportBlockBySource(block, [BEHAVIOUR_TYPE], AnimeStudioExportType.Raw, directory.behaviours);
  const targetBlocks = new Set(
    [...layoutFiles].flatMap((file) =>
      [file, ...(cabMap.get(file)?.dependencies ?? [])].flatMap((target) => cabMap.get(target)?.block ?? []),
    ),
  );
  const indexed = await readIndexedAssets(({ block }) => targetBlocks.has(block));
  const assetNameMap = new Map(
    indexed.map(({ block, name, pathId, type }) => [toObjectKey(block, pathId), `${type} ${name}`]),
  );
  const behaviours: ComponentBehaviour[] = [];
  for (const block of blocks) {
    const blockDirectory = join(directory.behaviours, basename(block, ".blk"), BEHAVIOUR_TYPE);
    if (!existsSync(blockDirectory)) continue;
    // oxlint-disable-next-line no-await-in-loop -- one block's scripts are read at a time
    for (const file of await readdir(blockDirectory)) {
      const nameTarget = (pointer: ObjectPointer): string | undefined => {
        const resolved = resolveObjectPointer(cabMap, file, pointer);
        if (!resolved) return undefined;
        return (
          objectNameMap.get(toObjectKey(resolved.file, resolved.pathId)) ??
          assetNameMap.get(toObjectKey(resolved.block, resolved.pathId))
        );
      };
      const describePointer = (pointer: ObjectPointer): string => {
        const resolved = resolveObjectPointer(cabMap, file, pointer);
        return `${nameTarget(pointer) ?? ""} (${resolved?.block ?? ""} ${resolved?.file ?? ""} ${pointer.pathId})`;
      };
      // oxlint-disable-next-line no-await-in-loop -- one file's scripts are listed at a time
      const scripts = (await readdir(join(blockDirectory, file))).filter(
        (name) => !scriptPattern || scriptPattern.test(basename(name, ".dat")),
      );
      for (const name of scripts) {
        // oxlint-disable-next-line no-await-in-loop -- one script's bytes are read at a time
        const bytes = await readFile(join(blockDirectory, file, name));
        behaviours.push({
          block,
          describePointer,
          fields: scanSerializedFields(bytes, (pointer) => nameTarget(pointer) !== undefined),
          file,
          script: basename(name, ".dat"),
        });
      }
    }
  }
  return behaviours;
};
