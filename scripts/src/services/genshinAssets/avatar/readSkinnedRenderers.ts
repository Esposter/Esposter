import type { SkinnedRenderer } from "#src/models/genshinAssets/avatar/SkinnedRenderer";
import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";

import { listCabDirectories } from "#src/services/genshinAssets/avatar/listCabDirectories";
import { readCabRenderers } from "#src/services/genshinAssets/avatar/readCabRenderers";
import { resolveDumpedPointer } from "#src/services/genshinAssets/avatar/resolveDumpedPointer";
import { settleAll } from "@esposter/shared";
import { basename } from "node:path";

// The CABs read at once, each holding its thousands of files while its dumps are read
const CAB_READ_CONCURRENCY = 4;

// Every skinned renderer dump of a layout, each with its pointers resolved through the CAB map
export const readSkinnedRenderers = async (
  layoutDirectory: string,
  cabMap: ReadonlyMap<string, CabEntry>,
): Promise<SkinnedRenderer[]> => {
  const cabDirectories = await listCabDirectories(layoutDirectory);
  const cabReads = await settleAll(
    cabDirectories.map((cabDirectory) => async () => ({
      dumps: await readCabRenderers(cabDirectory),
      file: basename(cabDirectory),
    })),
    CAB_READ_CONCURRENCY,
  );
  const renderers: SkinnedRenderer[] = [];
  for (const { dumps, file } of cabReads)
    for (const renderer of dumps)
      renderers.push({
        bones: renderer.m_Bones.map((pointer) => resolveDumpedPointer(cabMap, file, pointer)),
        file,
        materials: renderer.m_Materials.map((pointer) => resolveDumpedPointer(cabMap, file, pointer)),
        mesh: resolveDumpedPointer(cabMap, file, renderer.m_Mesh),
        renderer,
        rootBone: resolveDumpedPointer(cabMap, file, renderer.m_RootBone),
      });
  return renderers;
};
