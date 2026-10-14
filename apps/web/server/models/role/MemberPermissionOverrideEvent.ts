import type { MemberPermissionOverride } from "#shared/models/db/role/MemberPermissionOverride";
import type { UserInAuth } from "@esposter/db-schema";

// The state a member is left in, which is what a client applies: both zero means the roles decide alone
export interface MemberPermissionOverrideEvent extends MemberPermissionOverride {
  roomId: string;
  userId: UserInAuth["id"];
}
