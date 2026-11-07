import type { RunFitEntry } from "#src/models/genshinAssets/fit/RunFitEntry";
import type { DerivedAssetComponent } from "#src/models/genshinAssets/shared/DerivedAssetComponent";

import { AssetType } from "#src/models/genshinAssets/shared/AssetType";
import { fitPictureColour } from "#src/services/genshinAssets/colours/fitPictureColour";
import { readTexture } from "#src/services/genshinAssets/fit/readTexture";
import { PNG_EXTENSION } from "#src/services/genshinAssets/shared/constants";
import { getComponentDirectory } from "#src/services/genshinAssets/shared/getComponentDirectory";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { existsSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join, parse } from "node:path";

// Each portrait the component exported, as the colour its disc takes in place of the picture: the mean of the texture the
// Export holds, as the record `<component>/pictureColours`. It is opt-in, since it reads textures the install must export
// First: a named run on a component that exported no portrait fails, rather than writing an empty record over a published one
export const createPictureColoursEntry = (component: DerivedAssetComponent): RunFitEntry => [
  "pictureColours",
  async () => {
    const directory = join(getComponentDirectory(component).assets, AssetType.Texture2D);
    // A portrait is the exported texture under the name its picture takes; a folder with none of them has nothing to measure
    const files = existsSync(directory)
      ? (await readdir(directory)).filter(
          (file) => file.startsWith("UI_AvatarIcon_") && parse(file).ext === PNG_EXTENSION,
        )
      : [];
    if (files.length === 0)
      throw new InvalidOperationError(Operation.Read, directory, "holds no exported portrait texture to measure");
    const colours = await Promise.all(
      files.map(
        async (file) => [parse(file).name, fitPictureColour(await readTexture(join(directory, file)))] as const,
      ),
    );
    return {
      notes: [`${colours.length} portrait colours measured`],
      objects: { [`${component}/pictureColours`]: Object.fromEntries(colours) },
    };
  },
  { isOptIn: true },
];
