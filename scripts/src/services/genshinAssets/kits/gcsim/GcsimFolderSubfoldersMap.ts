import { GcsimFolderSubfolders } from "#src/models/genshinAssets/kits/gcsim/GcsimFolderSubfolders";
import { GCSIM_TRAVELER_FORM } from "#src/services/genshinAssets/kits/constants";
import { toGcsimFolderName } from "#src/services/genshinAssets/kits/gcsim/toGcsimFolderName";

// The folders below a gcsim character folder its files are read from, by the folder, where they are not the folder
// Itself: the Traveler's, whose kit is its Anemo form as Lumine plays it, the form's config and talent file under its
// Element and form and the Go files every form of the element shares under `common`
export const GcsimFolderSubfoldersMap: Readonly<Record<string, readonly string[]>> = {
  [GcsimFolderSubfolders.Traveler]: [`anemo/${toGcsimFolderName(GCSIM_TRAVELER_FORM)}`, "common/anemo"],
};
