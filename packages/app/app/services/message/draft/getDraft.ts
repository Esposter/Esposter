import type { Draft } from "@/models/message/Draft";

import { draftSchema } from "@/models/message/Draft";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { getIsServer, getResult } from "@esposter/shared";

export const getDraft = (roomId: string): Draft | undefined => {
  if (getIsServer()) return undefined;
  const value = localStorage.getItem(LocalStorageKey.Draft(roomId));
  if (!value) return undefined;
  return getResult(() => draftSchema.parse(JSON.parse(value))).unwrapOr(undefined);
};
