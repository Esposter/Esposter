import { normalizeString } from "@esposter/shared";

// The one name a member shows in a room: the display name they saved, trimmed, and the account's own name in place of
// A blank or absent one. A member who never set one has the blank default, so that is the common case
export const getResolvedDisplayName = (displayName: string | undefined, accountName: string) =>
  normalizeString(displayName) || accountName;
