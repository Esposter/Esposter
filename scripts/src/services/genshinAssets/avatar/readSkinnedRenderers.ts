import type { SkinnedRenderer } from "#src/models/genshinAssets/avatar/SkinnedRenderer";
import type { CabEntry } from "#src/models/recreation/animeStudio/CabEntry";

import { listCabDirectories } from "#src/services/genshinAssets/avatar/listCabDirectories";
import { readCabRenderers } from "#src/services/genshinAssets/avatar/readCabRenderers";
import { resolveDumpedPointer } from "#src/services/genshinAssets/avatar/resolveDumpedPointer";
import { basename } from "node:path";

// Every skinned renderer dump of a layout, each with its pointers resolved through the CAB map
export const readSkinnedRenderers = async (
  layoutDirectory: string,
  cabMap: ReadonlyMap<string, CabEntry>,
): Promise<SkinnedRenderer[]> => {
  const renderers: SkinnedRenderer[] = [];
  for (const cabDirectory of await listCabDirectories(layoutDirectory)) {
    const file = basename(cabDirectory);
    // oxlint-disable-next-line no-await-in-loop -- one CAB's dumps are read at a time, holding their thousands of files
    const dumps = await readCabRenderers(cabDirectory);
    for (const renderer of dumps)
      renderers.push({
        bones: renderer.m_Bones.map((pointer) => resolveDumpedPointer(cabMap, file, pointer)),
        file,
        materials: renderer.m_Materials.map((pointer) => resolveDumpedPointer(cabMap, file, pointer)),
        mesh: resolveDumpedPointer(cabMap, file, renderer.m_Mesh),
        renderer,
        rootBone: resolveDumpedPointer(cabMap, file, renderer.m_RootBone),
      });
  }
  return renderers;
};
