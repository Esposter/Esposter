import { REFERENCES_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { join } from "node:path";

// The namecards' art and icons exported from the installed game as references, the art and the icons each in a folder of
// Their own, kept outside the repository like every other export and never shipped
export const NAMECARD_DIRECTORY: string = join(REFERENCES_DIRECTORY, "namecards");
export const NAMECARD_ART_DIRECTORY: string = join(NAMECARD_DIRECTORY, "cards");
export const NAMECARD_ICON_DIRECTORY: string = join(NAMECARD_DIRECTORY, "icons");
// The asset names a namecard's art and its icon are held under in the asset index, by the namecard's own name
export const NAMECARD_ART_PREFIX = "UI_NameCardPic_";
export const NAMECARD_ICON_PREFIX = "UI_NameCardIcon_";
