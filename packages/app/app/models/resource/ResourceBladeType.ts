/* eslint-disable perfectionist/sort-enums */
// Built-in blade slugs every resource has; per-type blades come from ResourceBladeDefinitionMap.
// Declaration order is the nav order, which getResourceBladeDefinitions reproduces — the sort rule is
// Disabled so this stays readable as that order rather than alphabetically.
export enum ResourceBladeType {
  Overview = "overview",
  Editor = "editor",
  Activity = "activity",
}
