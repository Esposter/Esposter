import type { MemberPermissionOverride } from "#shared/models/db/role/MemberPermissionOverride";
import type { UpsertMemberPermissionOverrideInput } from "#shared/models/db/role/UpsertMemberPermissionOverrideInput";

// The three bitfields move a bit between states, so a write clears every bit it names from both fields before it sets
// the ones it allows or denies. Passing a bit into the opposite field therefore moves it rather than leaving it set in
// both, which the two fields must never be. A bit in none of the three is left as it was
export const mergeMemberPermissionOverride = (
  { allow, deny }: MemberPermissionOverride,
  { allow: allowBits, deny: denyBits, inherit }: UpsertMemberPermissionOverrideInput,
): MemberPermissionOverride => {
  const clearedBits = allowBits | denyBits | inherit;
  return { allow: (allow & ~clearedBits) | allowBits, deny: (deny & ~clearedBits) | denyBits };
};
