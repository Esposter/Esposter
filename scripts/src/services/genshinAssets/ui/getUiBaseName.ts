import { UI_DUPLICATE_SUFFIX_REGEX } from "#src/services/genshinAssets/ui/constants";

// A name with the suffix AnimeStudio gives a repeated name taken off, the name the object was made with
export const getUiBaseName = (name: string): string => name.replace(UI_DUPLICATE_SUFFIX_REGEX, "");
