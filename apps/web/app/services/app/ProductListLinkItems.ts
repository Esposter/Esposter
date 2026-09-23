// @unocss-include
import type { ListLinkItem } from "@/models/shared/ListLinkItem";

import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";
import { RoutePath } from "@esposter/shared";

export const ProductListLinkItems = [
  { href: RoutePath.MessagesIndex, icon: "i-mdi:message-fast", title: MESSAGE_DISPLAY_NAME },
  { href: RoutePath.CallsIndex, icon: "i-mdi:video", title: "Calls" },
  { href: RoutePath.ResourceExplorer, icon: "i-mdi:earth", title: "Resource Explorer" },
  { href: RoutePath.AgentConsole, icon: "i-mdi:console", title: "Agent Console" },
  {
    children: [
      {
        href: RoutePath.Clicker,
        icon: "i-mdi:cursor-pointer",
        title: "Clicker",
      },
      {
        href: RoutePath.Dungeons,
        icon: "custom:dungeon-gate",
        title: "Dungeons",
      },
    ],
    icon: "i-mdi:gamepad-variant",
    title: "Games",
  },
] as const satisfies ListLinkItem[];
