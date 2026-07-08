/* eslint-disable perfectionist/sort-enums */
// Blade slugs every resource has in Phase 2; per-type blades (ResourceBladeDefinitionMap) join as editors migrate.
// Declaration order is the nav order, so the sort rule is disabled to keep Overview first (Object.values reads it).
export enum ResourceBladeType {
  Overview = "overview",
  Editor = "editor",
}
// Set iteration preserves the declaration order, so the nav renders Overview → Editor.
export const ResourceBladeTypes: ReadonlySet<ResourceBladeType> = new Set(Object.values(ResourceBladeType));
