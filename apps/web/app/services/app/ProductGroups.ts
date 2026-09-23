// @unocss-include
import type { ProductGroup } from "@/models/app/ProductGroup";

import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";
import { RoutePath } from "@esposter/shared";

export const ProductGroups = [
  {
    items: [
      { href: RoutePath.MessagesIndex, icon: "i-mdi:message-fast", title: MESSAGE_DISPLAY_NAME },
      { href: RoutePath.CallsIndex, icon: "i-mdi:video", title: "Calls" },
    ],
    title: "Talk",
  },
  { items: [{ href: RoutePath.ResourceExplorer, icon: "i-mdi:earth", title: "Resource Explorer" }], title: "Make" },
  { items: [{ href: RoutePath.AgentConsole, icon: "i-mdi:console", title: "Agent Console" }], title: "Build" },
  {
    items: [
      { href: RoutePath.Clicker, icon: "i-mdi:cursor-pointer", title: "Clicker" },
      { href: RoutePath.Dungeons, icon: "i-custom:dungeon-gate", title: "Dungeons" },
    ],
    title: "Play",
  },
] as const satisfies ProductGroup[];
