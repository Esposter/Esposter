// Built-in blade slugs every resource has; per-type blades come from ResourceBladeDefinitionMap.
export const ResourceBladeType = { Activity: "activity", Editor: "editor", Overview: "overview" } as const;
export type ResourceBladeType = (typeof ResourceBladeType)[keyof typeof ResourceBladeType];
