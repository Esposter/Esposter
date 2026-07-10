/* eslint-disable perfectionist/sort-enums */
// Built-in blade slugs every resource has; per-type blades come from ResourceBladeDefinitionMap.
// Declaration order is the nav order, so the sort rule is disabled to keep Overview first (Object.values reads it).
export enum ResourceBladeType {
  Overview = "overview",
  Editor = "editor",
}
// Set iteration preserves the declaration order, so the nav renders Overview → Editor.
export const ResourceBladeTypes: ReadonlySet<ResourceBladeType> = new Set(Object.values(ResourceBladeType));
