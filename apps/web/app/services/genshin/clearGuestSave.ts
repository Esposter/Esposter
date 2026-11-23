import { genshinLocalSave } from "#src/services/genshin/genshinLocalSave";
import { getResult, noop } from "@esposter/shared";

export const clearGuestSave = () => {
  getResult(() => {
    // The offline save system reads and writes this
    // oxlint-disable-next-line selector-ban/no-restricted-syntax -- key imperatively, the way `readGuestSave` reads it
    window.localStorage.removeItem(genshinLocalSave.key);
  }).match(noop, console.error);
};
