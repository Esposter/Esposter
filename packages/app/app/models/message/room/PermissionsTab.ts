export enum PermissionsTab {
  Members = "Members",
  Roles = "Roles",
}

export const PermissionsTabs: ReadonlySet<PermissionsTab> = new Set(Object.values(PermissionsTab));
