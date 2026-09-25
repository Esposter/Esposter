import type { Item } from "@/models/shared/Item";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { copyLinkToClipboard } from "@/services/resource/copyLinkToClipboard";
import { RoutePath } from "@esposter/shared";

// What a resource's link offers wherever a row of one has a menu: the resource beside the current page, and its address
export const getResourceLinkItems = (id: string): Item[] => [
  {
    meaning: UiIconMeaning.External,
    onClick: () => {
      window.open(RoutePath.Resource(id), "_blank");
    },
    title: "Open in new tab",
  },
  { meaning: UiIconMeaning.Link, onClick: () => copyLinkToClipboard(RoutePath.Resource(id)), title: "Copy link" },
];
