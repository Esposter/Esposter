import { ResourceActivityType } from "@esposter/db-schema";
// Severity-neutral: an activity trail records what happened, it never judges it
export const ResourceActivityIconMap: Record<ResourceActivityType, string> = {
  [ResourceActivityType.ContentSaved]: "mdi-content-save-outline",
  [ResourceActivityType.Created]: "mdi-plus-circle-outline",
  [ResourceActivityType.Duplicated]: "mdi-content-copy",
  [ResourceActivityType.Published]: "mdi-earth",
  [ResourceActivityType.Renamed]: "mdi-pencil-outline",
  [ResourceActivityType.Restored]: "mdi-restore",
  [ResourceActivityType.Unpublished]: "mdi-earth-off",
};
