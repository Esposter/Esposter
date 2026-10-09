// One member's override state in a room, both bitfields zero when the member has no row and the roles decide alone
export interface MemberPermissionOverride {
  allow: bigint;
  deny: bigint;
}

export interface MemberPermissionOverrideEntry extends MemberPermissionOverride {
  userId: string;
}
