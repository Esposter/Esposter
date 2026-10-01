import { runAnimeStudio } from "#src/services/genshinAssets/runAnimeStudio";
import { SDK_BUNDLE_PATH, SDK_TEXT_DIRECTORY } from "#src/services/genshinText/constants";

// The account kit's string tables out of its bundle, by the path each was built from, since its language tables and
// Its region names share file names and would overwrite each other exported by name
export const exportSdkText = (): void => {
  runAnimeStudio([SDK_BUNDLE_PATH, SDK_TEXT_DIRECTORY, "--types", "TextAsset", "--group_assets", "ByContainer"]);
};
