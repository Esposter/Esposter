import type { Draft } from "@/models/message/Draft";

import { draftSchema } from "@/models/message/Draft";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { getIsServer, getResult } from "@esposter/shared";

export const getDraft = (composerKey: string): Draft | undefined => {
  if (getIsServer()) return undefined;
  const value = window.localStorage.getItem(LocalStorageKey.Draft(composerKey));
  if (!value) return undefined;
  // eslint-disable-next-line no-restricted-syntax -- draftSchema coerces updatedAt itself, so a draft body that is an ISO datetime stays a string
  return getResult(() => draftSchema.parse(JSON.parse(value))).unwrapOr(undefined);
};
