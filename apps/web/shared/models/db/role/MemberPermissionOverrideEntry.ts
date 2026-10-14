import type { MemberPermissionOverride } from "#shared/models/db/role/MemberPermissionOverride";

export interface MemberPermissionOverrideEntry extends MemberPermissionOverride {
  userId: string;
}
