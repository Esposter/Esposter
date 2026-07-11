import type { ListLinkItem } from "@/models/shared/ListLinkItem";

import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";
import { RoutePath } from "@esposter/shared";

export const ProductListLinkItems = [
  {
    href: RoutePath.MessagesIndex,
    icon: "mdi-message-fast",
    title: MESSAGE_DISPLAY_NAME,
  },
  {
    href: RoutePath.CallsIndex,
    icon: "mdi-video",
    title: "Calls",
  },
  {
    href: RoutePath.Resources,
    icon: "mdi-earth",
    title: "Resource Explorer",
  },
  {
    children: [
      {
        href: RoutePath.Clicker,
        icon: "mdi-cursor-pointer",
        title: "Clicker",
      },
      {
        href: RoutePath.Dungeons,
        icon: "custom:dungeon-gate",
        title: "Dungeons",
      },
    ],
    icon: "mdi-gamepad-variant",
    title: "Games",
  },
] as const satisfies ListLinkItem[];
