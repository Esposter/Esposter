// The three states a member's override holds one permission in: granted, refused, or left to the roles
export const PermissionOverrideState = { Allow: "allow", Deny: "deny", Inherit: "inherit" } as const;
export type PermissionOverrideState = (typeof PermissionOverrideState)[keyof typeof PermissionOverrideState];
