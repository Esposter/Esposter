import type { MemberPermissionOverrideEntry } from "#shared/models/db/role/MemberPermissionOverrideEntry";

// The state a member is left in, which is what a client applies: both zero means the roles decide alone
export interface MemberPermissionOverrideEvent extends MemberPermissionOverrideEntry {
  roomId: string;
}
