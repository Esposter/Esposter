// The three states a member's override holds one permission in: granted, refused, or left to the roles
export enum PermissionOverrideState {
  Allow = "allow",
  Deny = "deny",
  Inherit = "inherit",
}
