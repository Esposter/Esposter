import { normalizeString } from "@esposter/shared";

// The name a member's row shows for the display name they saved, resolved as the server stores it: trimmed, and the
// Account's own name in place of a blank one
export const getResolvedDisplayName = (displayName: string, accountName: string) =>
  normalizeString(displayName) || accountName;
