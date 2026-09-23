// @unocss-include
import type { Item } from "@/models/shared/Item";

import { ResourceActivityType } from "@esposter/db-schema";
// Icons are severity-neutral: an activity trail records what happened, it never judges it
export const ResourceActivityDefinitionMap = {
  [ResourceActivityType.ContentSaved]: { icon: "i-mdi:content-save-outline", title: "Content saved" },
  [ResourceActivityType.Created]: { icon: "i-mdi:plus-circle-outline", title: "Created" },
  [ResourceActivityType.Duplicated]: { icon: "i-mdi:content-copy", title: "Duplicated" },
  [ResourceActivityType.Published]: { icon: "i-mdi:earth", title: "Published" },
  [ResourceActivityType.Renamed]: { icon: "i-mdi:pencil-outline", title: "Renamed" },
  [ResourceActivityType.Restored]: { icon: "i-mdi:restore", title: "Restored" },
  [ResourceActivityType.Unpublished]: { icon: "i-mdi:earth-off", title: "Unpublished" },
} as const satisfies Record<ResourceActivityType, Item>;
