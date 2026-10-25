// @unocss-include
import { ResourceBladeType } from "@/models/resource/ResourceBladeType";

// How each built-in blade presents itself, in one entry per blade. Editor is the exception that declares no
// Icon: it renders the type's own editor, so it wears the type's own icon rather than one of its own
export const BuiltInBladeDefinitionMap = {
  [ResourceBladeType.Activity]: { icon: "i-mdi:history", title: "Activity" },
  [ResourceBladeType.Editor]: { title: "Editor" },
  [ResourceBladeType.Overview]: { icon: "i-mdi:information-outline", title: "Overview" },
} as const satisfies Record<ResourceBladeType, { icon?: string; title: string }>;
