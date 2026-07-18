import { ResourceBladeType } from "@/models/resource/ResourceBladeType";

export const ResourceBladeTitleMap: Record<ResourceBladeType, string> = {
  [ResourceBladeType.Activity]: "Activity",
  [ResourceBladeType.Editor]: "Editor",
  [ResourceBladeType.Overview]: "Overview",
};
