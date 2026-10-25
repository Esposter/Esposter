import type { AvatarRig } from "#src/models/genshinAssets/avatar/AvatarRig";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { readAvatarRig } from "#src/services/genshinAssets/avatar/readAvatarRig";
import { GENSHIN_ANIMESTUDIO_OPTIONS, INSTALLED_BLOCKS_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { runAnimeStudio } from "#src/services/recreation/animeStudio/runAnimeStudio";
import { withFinalizerAsync } from "@esposter/shared";
import { readFile, rm } from "node:fs/promises";
import { join } from "node:path";

// The rig of the Avatar asset, exported from its block into a folder beside the component's exports and removed once read
export const exportRig = (block: string, name: string, root: string): Promise<AvatarRig> => {
  const outDirectory = join(root, "avatar-source");
  runAnimeStudio(
    [
      join(INSTALLED_BLOCKS_DIRECTORY, block),
      outDirectory,
      "--types",
      AssetType.Avatar,
      "--names",
      name,
      "--export_type",
      "JSON",
    ],
    GENSHIN_ANIMESTUDIO_OPTIONS,
  );
  return withFinalizerAsync(
    async () => readAvatarRig(await readFile(join(outDirectory, AssetType.Avatar, `${name}.json`), "utf8")),
    () => rm(outDirectory, { force: true, recursive: true }),
  );
};
