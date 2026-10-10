import type { InterfaceNode } from "#src/models/genshinAssets/shared/InterfaceNode";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitInterfaceRects } from "#src/services/genshinAssets/fit/fitInterfaceRects";
import { runFits } from "#src/services/genshinAssets/fit/runFits";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { writeWorldData } from "#src/services/genshinAssets/shared/writeWorldData";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The HUD's interface as the rects its markup nests, fitted from the tree `genshin:assets interface` exported and
// Written as a data file of the world package's
export const fitHud = (only: readonly string[] = []): Promise<string> => {
  const { root } = getComponentDirectory(DerivedAssetComponent.Hud);
  return runFits(
    {
      interfaceRects: async () => {
        const interfaceTree = parseMachineJson<InterfaceNode>(
          await readFile(join(root, "interface", "interface.json"), "utf8"),
        );
        return [await writeWorldData("hud/interfaceRects.json", fitInterfaceRects(interfaceTree))];
      },
    },
    only,
  );
};
