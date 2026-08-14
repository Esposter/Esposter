import { LocalStorageKey } from "@/services/shared/LocalStorageKey";

export const removeDraft = (composerKey: string) => {
  localStorage.removeItem(LocalStorageKey.Draft(composerKey));
};
