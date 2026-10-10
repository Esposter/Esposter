import type { GenshinSave } from "genshin-world/save";

import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { parseJsonWithSchema } from "@/services/shared/parseJsonWithSchema";
import { getResult } from "@esposter/shared";
import { genshinSaveSchema } from "genshin-world/save";

// A browser that blocks its storage throws on the access, which is logged and read as no guest save, so a signed-in
// Player's account save still loads
export const readGuestSave = (): GenshinSave | undefined => {
  const guestJson = getResult(
    // eslint-disable-next-line no-restricted-syntax -- the offline save system reads and writes this key imperatively through `useSaveToLocalStorage`; a ref would be a second owner of it. The read is already client-only, inside `useReadData`'s `onMounted`
    () => window.localStorage.getItem(LocalStorageKey.GenshinSave),
  )
    .orTee(console.error)
    .unwrapOr(null);
  return guestJson ? parseJsonWithSchema(guestJson, genshinSaveSchema) : undefined;
};
