import { toObjectKey } from "#src/services/genshinAssets/shared/toObjectKey";

// The one key a UI object is held by: its block, its container and its GameObject's path ID. The name is a field, since
// AnimeStudio gives two same-named objects of one folder the same name, and a path ID names one object within its block
export const toUiObjectKey = (block: string, container: string, pathId: string): string =>
  toObjectKey(`${block}/${container}`, pathId);
