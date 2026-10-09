import type { GameDataBuild } from "#src/models/gameData/GameDataBuild";
import type { InterfaceNode } from "#src/models/genshinAssets/shared/InterfaceNode";

import { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import { fitInterfaceRects } from "#src/services/genshinAssets/fit/fitInterfaceRects";
import { runFits } from "#src/services/genshinAssets/fit/runFits";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The HUD's interface as the rects its markup nests, fitted from the tree `genshin:assets interface` exported, as the
// Record `hud/interfaceRects`
export const fitHud = (only: readonly string[] = []): Promise<GameDataBuild> => {
  const { root } = getComponentDirectory(DerivedAssetComponent.Hud);
  return runFits(
    {
      interfaceRects: async () => {
        const interfaceTree = parseMachineJson<InterfaceNode>(
          await readFile(join(root, "interface", "interface.json"), "utf8"),
        );
        return { notes: [], objects: { "hud/interfaceRects": fitInterfaceRects(interfaceTree) } };
      },
    },
    only,
  );
};
