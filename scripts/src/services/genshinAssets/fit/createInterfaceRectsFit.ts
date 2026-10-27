import type { DerivedAssetFit } from "#src/models/genshinAssets/fit/DerivedAssetFit";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { InterfaceNode } from "#src/models/genshinAssets/shared/InterfaceNode";

import { fitInterfaceRects } from "#src/services/genshinAssets/fit/fitInterfaceRects";
import { runFits } from "#src/services/genshinAssets/fit/runFits";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// A screen's interface as the rects its markup nests, fitted from the tree `genshin:assets interface` exported for the
// Component, as the record `<component>/interfaceRects`
export const createInterfaceRectsFit =
  (component: DerivedAssetComponent): DerivedAssetFit =>
  (only, options) => {
    const { root } = getComponentDirectory(component);
    return runFits(
      {
        interfaceRects: async () => {
          const interfaceTree = parseMachineJson<InterfaceNode>(
            await readFile(join(root, "interface", "interface.json"), "utf8"),
          );
          return { notes: [], objects: { [`${component}/interfaceRects`]: fitInterfaceRects(interfaceTree) } };
        },
      },
      only,
      options,
    );
  };
