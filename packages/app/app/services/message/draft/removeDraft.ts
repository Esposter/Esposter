import { LocalStorageKey } from "@/services/shared/LocalStorageKey";

export const removeDraft = (composerKey: string) => {
  window.localStorage.removeItem(LocalStorageKey.Draft(composerKey));
};
