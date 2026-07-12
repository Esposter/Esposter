import type { ResourceSearchItem } from "@/models/resource/search/ResourceSearchItem";

import { ResourceSearchGroup } from "@/models/resource/search/ResourceSearchGroup";
import { RoutePath } from "@esposter/shared";

export const PageSearchItems = [
  {
    group: ResourceSearchGroup.Pages,
    icon: "mdi-home-outline",
    id: `${ResourceSearchGroup.Pages}-home`,
    title: "Home",
    to: RoutePath.Resources,
  },
  {
    group: ResourceSearchGroup.Pages,
    icon: "mdi-format-list-bulleted",
    id: `${ResourceSearchGroup.Pages}-all-resources`,
    title: "All resources",
    to: RoutePath.ResourcesAll,
  },
  {
    group: ResourceSearchGroup.Pages,
    icon: "mdi-plus-box-outline",
    id: `${ResourceSearchGroup.Pages}-create-a-resource`,
    title: "Create a resource",
    to: RoutePath.ResourcesCreate,
  },
] as const satisfies readonly ResourceSearchItem[];
