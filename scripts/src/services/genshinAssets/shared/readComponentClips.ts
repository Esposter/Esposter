import type { DecodedClip } from "#src/models/genshinAssets/shared/DecodedClip";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// A component's clips as `genshin:assets clips` decoded them
export const readComponentClips = async (component: DerivedAssetComponent): Promise<DecodedClip[]> =>
  parseMachineJson<DecodedClip[]>(
    await readFile(join(getComponentDirectory(component).root, "clips", "clips.json"), "utf8"),
  );
