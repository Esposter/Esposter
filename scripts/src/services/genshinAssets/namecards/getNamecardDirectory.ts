import {
  NAMECARD_ART_DIRECTORY,
  NAMECARD_ICON_DIRECTORY,
  NAMECARD_ICON_PREFIX,
} from "#src/services/genshinAssets/namecards/constants";

// The folder a namecard's PNG is written to: its icon apart from its art
export const getNamecardDirectory = (name: string): string =>
  name.startsWith(NAMECARD_ICON_PREFIX) ? NAMECARD_ICON_DIRECTORY : NAMECARD_ART_DIRECTORY;
