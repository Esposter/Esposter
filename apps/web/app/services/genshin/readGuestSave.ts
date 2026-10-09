import type { GenshinSave } from "genshin-world/save";

import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
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
  if (!guestJson) return undefined;

  // Parsed as plain JSON, because the save holds its instants as ISO strings the schema reads. A date revival would turn
  // Them into Dates, which `z.iso.datetime()` rejects, so every save would read as none
  // oxlint-disable-next-line no-restricted-properties -- the save schema reads its instants as ISO strings itself, so there is no Date for a reviver to restore
  const parsedJson: unknown = getResult(() => JSON.parse(guestJson))
    .orTee(console.error)
    .unwrapOr(undefined);
  const result = genshinSaveSchema.safeParse(parsedJson);
  return result.success ? result.data : undefined;
};
