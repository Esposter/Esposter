import { EXTRACTED_DIRECTORY } from "#src/services/genshinAssets/shared/constants";
import { join } from "node:path";

// The weapon icons exported from the installed game, each a PNG under the icon name the weapon table gives it, kept
// Outside the repository like every other export and never shipped
export const WEAPON_ICON_DIRECTORY: string = join(EXTRACTED_DIRECTORY, "weapons", "icons");
