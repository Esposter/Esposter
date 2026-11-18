import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";
import type { AvatarManifest } from "genshin-world/sceneExport";

import { computeBonePaths } from "#src/services/genshinAssets/interface/computeBonePaths";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { parseMachineJson } from "#src/services/shared/parseMachineJson";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { AVATAR_MANIFEST_FILE_NAME } from "genshin-world/sceneExport";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

// The bone paths of a component's game model, from the rig its avatar was written with, which the clips of a component
// That binds another model's rig name their paths by
export const readSkeletonPaths = async (component: DerivedAssetComponent): Promise<string[]> => {
  const avatarPath = join(getComponentDirectory(component).root, AVATAR_MANIFEST_FILE_NAME);
  if (!existsSync(avatarPath))
    throw new InvalidOperationError(Operation.Read, component, "has no avatar to name its clips' bones by");
  const { bones } = parseMachineJson<AvatarManifest>(await readFile(avatarPath, "utf8"));
  return computeBonePaths(bones);
};
