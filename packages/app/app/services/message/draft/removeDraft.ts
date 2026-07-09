import { LocalStorageKey } from "@/services/shared/LocalStorageKey";

export const removeDraft = (roomId: string) => {
  localStorage.removeItem(LocalStorageKey.Draft(roomId));
};
