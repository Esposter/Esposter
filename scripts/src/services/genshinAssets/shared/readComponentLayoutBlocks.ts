import type { ComponentLayoutBlocks } from "#src/models/genshinAssets/shared/ComponentLayoutBlocks";

import { CAB_MAP_PATH } from "#src/services/genshinAssets/shared/constants";
import { readSceneLayout } from "#src/services/genshinAssets/shared/readSceneLayout";
import { parseCabMap } from "#src/services/recreation/animeStudio/parseCabMap";
import { readdir, readFile } from "node:fs/promises";

// The blocks a component's layout dumps are held in: the CABs its layout folder names, looked up in the CAB map, with
// Each one's block, and the layout's name of every object it dumps. A folder names a CAB only where the map holds it
export const readComponentLayoutBlocks = async (layoutDirectory: string): Promise<ComponentLayoutBlocks> => {
  const [cabMapBytes, { objectNameMap }] = await Promise.all([
    readFile(CAB_MAP_PATH),
    readSceneLayout(layoutDirectory),
  ]);
  const cabMap = parseCabMap(cabMapBytes);
  const layoutFiles = new Set(
    (await readdir(layoutDirectory, { recursive: true, withFileTypes: true }))
      .filter((entry) => entry.isDirectory() && cabMap.has(entry.name))
      .map(({ name }) => name),
  );
  const blocks = new Set([...layoutFiles].flatMap((file) => cabMap.get(file)?.block ?? []));
  return { blocks, cabMap, layoutFiles, objectNameMap };
};
