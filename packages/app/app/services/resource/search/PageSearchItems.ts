import type { ResourceSearchItem } from "@/models/resource/search/ResourceSearchItem";

import { ResourceSearchGroup } from "@/models/resource/search/ResourceSearchGroup";
import { RoutePath } from "@esposter/shared";

export const PageSearchItems = [
  {
    group: ResourceSearchGroup.Pages,
    icon: "mdi-home-outline",
    id: `${ResourceSearchGroup.Pages}-home`,
    title: "Home",
    to: RoutePath.ResourceExplorer,
  },
  {
    group: ResourceSearchGroup.Pages,
    icon: "mdi-format-list-bulleted",
    id: `${ResourceSearchGroup.Pages}-all-resources`,
    title: "All resources",
    to: RoutePath.ResourceExplorerAll,
  },
  {
    group: ResourceSearchGroup.Pages,
    icon: "mdi-star-outline",
    id: `${ResourceSearchGroup.Pages}-favorite-resources`,
    title: "Favorite resources",
    to: RoutePath.ResourceExplorerFavorites,
  },
  {
    group: ResourceSearchGroup.Pages,
    icon: "mdi-history",
    id: `${ResourceSearchGroup.Pages}-recent-resources`,
    title: "Recent resources",
    to: RoutePath.ResourceExplorerRecents,
  },
  {
    group: ResourceSearchGroup.Pages,
    icon: "mdi-tag-multiple-outline",
    id: `${ResourceSearchGroup.Pages}-tags`,
    title: "Tags",
    to: RoutePath.ResourceExplorerTags,
  },
  {
    group: ResourceSearchGroup.Pages,
    icon: "mdi-delete-outline",
    id: `${ResourceSearchGroup.Pages}-recycle-bin`,
    title: "Recycle bin",
    to: RoutePath.ResourceExplorerRecycleBin,
  },
  {
    group: ResourceSearchGroup.Pages,
    icon: "mdi-plus-box-outline",
    id: `${ResourceSearchGroup.Pages}-create-a-resource`,
    title: "Create a resource",
    to: RoutePath.ResourceExplorerCreate,
  },
] as const satisfies readonly ResourceSearchItem[];
