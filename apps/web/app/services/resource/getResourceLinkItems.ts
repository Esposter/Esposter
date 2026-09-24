// @unocss-include
import type { Item } from "@/models/shared/Item";

import { copyLinkToClipboard } from "@/services/resource/copyLinkToClipboard";
import { RoutePath } from "@esposter/shared";

// What a resource's link offers wherever a row of one has a menu: the resource beside the current page, and its address
export const getResourceLinkItems = (id: string): Item[] => [
  {
    icon: "i-pixelarticons:external-link",
    onClick: () => {
      window.open(RoutePath.Resource(id), "_blank");
    },
    title: "Open in new tab",
  },
  { icon: "i-pixelarticons:link", onClick: () => copyLinkToClipboard(RoutePath.Resource(id)), title: "Copy link" },
];
