import type { Item } from "@/models/shared/Item";

import { ResourceActivityType } from "@esposter/db-schema";
// Icons are severity-neutral: an activity trail records what happened, it never judges it
export const ResourceActivityDefinitionMap = {
  [ResourceActivityType.ContentSaved]: { icon: "mdi-content-save-outline", title: "Content saved" },
  [ResourceActivityType.Created]: { icon: "mdi-plus-circle-outline", title: "Created" },
  [ResourceActivityType.Duplicated]: { icon: "mdi-content-copy", title: "Duplicated" },
  [ResourceActivityType.Published]: { icon: "mdi-earth", title: "Published" },
  [ResourceActivityType.Renamed]: { icon: "mdi-pencil-outline", title: "Renamed" },
  [ResourceActivityType.Restored]: { icon: "mdi-restore", title: "Restored" },
  [ResourceActivityType.Unpublished]: { icon: "mdi-earth-off", title: "Unpublished" },
} as const satisfies Record<ResourceActivityType, Item>;
