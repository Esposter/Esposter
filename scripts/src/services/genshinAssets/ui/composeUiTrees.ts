import type { UiTrees } from "#src/models/genshinAssets/ui/UiTrees";
import type { UiIndexEntry } from "#src/models/genshinAssets/ui/UiIndexEntry";

import { composeInterfaceTree } from "#src/services/genshinAssets/interface/composeInterfaceTree";
import { findNearestUiCanvas } from "#src/services/genshinAssets/ui/findNearestUiCanvas";
import { getUiRootEntries } from "#src/services/genshinAssets/ui/getUiRootEntries";

// A container's RectTransform trees, `depth` levels below each root, and the canvas scaler nearest their roots. The canvas
// is searched in the whole trees, so a depth that cuts its piece off still names it
export const composeUiTrees = (entries: readonly UiIndexEntry[], depth: number): UiTrees => {
  const rootEntries = getUiRootEntries(entries);
  return {
    canvas: findNearestUiCanvas(rootEntries.map((root) => composeInterfaceTree(entries, root))),
    roots: rootEntries.map((root) => composeInterfaceTree(entries, root, depth)),
  };
};
