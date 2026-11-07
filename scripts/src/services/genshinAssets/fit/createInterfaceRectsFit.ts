import type { DerivedAssetFit } from "#src/models/genshinAssets/fit/DerivedAssetFit";
import type { RunFitEntry } from "#src/models/genshinAssets/fit/RunFitEntry";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { InterfaceNode } from "#src/models/genshinAssets/shared/InterfaceNode";

import { fitInterfaceRects } from "#src/services/genshinAssets/fit/fitInterfaceRects";
import { runFits } from "#src/services/genshinAssets/fit/runFits";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { readGameVersion } from "#src/services/genshinAssets/shared/readGameVersion";
import { readVouchedProvenance } from "#src/services/provenance/readVouchedProvenance";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// A component's interface as the rects its markup nests, fitted from the tree `genshin:assets interface` exported for it,
// As the record `<component>/interfaceRects`
export const createInterfaceRectsEntry = (component: DerivedAssetComponent): RunFitEntry => [
  "interfaceRects",
  async () => {
    const { root } = getComponentDirectory(component);
    await readVouchedProvenance(join(root, "interface"), await readGameVersion());
    const interfaceTree = parseMachineJson<InterfaceNode>(
      await readFile(join(root, "interface", "interface.json"), "utf8"),
    );
    return { notes: [], objects: { [`${component}/interfaceRects`]: fitInterfaceRects(interfaceTree) } };
  },
];

export const createInterfaceRectsFit =
  (component: DerivedAssetComponent): DerivedAssetFit =>
  (only, options) =>
    runFits([createInterfaceRectsEntry(component)], only, options);
