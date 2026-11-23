import { toDungeonsKeyName } from "#src/services/dungeons/toDungeonsKeyName";
import { writeHostedAssetKeysFile } from "#src/services/hostedAssets/writeHostedAssetKeysFile";
import { join } from "node:path";

// The web app's Nuxt module that writes the dungeons game's key map from its committed lock, once `nuxt prepare` has loaded
// The app. The module is registered by its source in `apps/web/configuration/modules.ts`, as the workspace's other modules
// Are, since `nuxt prepare` runs before any workspace package is built
const dungeonsKeysModule = (
  _options: unknown,
  nuxt: { hook: (name: "ready", callback: () => Promise<void>) => void; options: { rootDir: string } },
) => {
  nuxt.hook("ready", () =>
    writeHostedAssetKeysFile(
      "Dungeons",
      join(nuxt.options.rootDir, "shared/generated/hostedAssets/dungeonsLock.json"),
      join(nuxt.options.rootDir, "shared/generated/hostedAssetKeys/dungeonsKeys.ts"),
      toDungeonsKeyName,
    ),
  );
};

export default dungeonsKeysModule;
