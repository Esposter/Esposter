// @unocss-include
import type { ProductGroup } from "#src/models/app/ProductGroup";

import { MESSAGE_DISPLAY_NAME } from "#shared/services/message/constants";
import { RESOURCE_EXPLORER_DISPLAY_NAME } from "#src/services/resource/constants";
import { RoutePath } from "@esposter/shared";

export const ProductGroups = [
  {
    items: [
      {
        description: "Chat with friends in rooms and threads.",
        href: RoutePath.MessagesIndex,
        icon: "i-mdi:message-fast",
        title: MESSAGE_DISPLAY_NAME,
      },
      { description: "Talk face to face, on video.", href: RoutePath.CallsIndex, icon: "i-mdi:video", title: "Calls" },
    ],
    title: "Talk",
  },
  {
    items: [
      {
        description: "Notes, forms, whiteboards and web pages, all in one place.",
        href: RoutePath.ResourceExplorer,
        icon: "i-mdi:earth",
        title: RESOURCE_EXPLORER_DISPLAY_NAME,
      },
    ],
    title: "Make",
  },
  {
    items: [
      {
        description: "A fan-made anime world to wander, right in your browser.",
        href: RoutePath.Genshin,
        icon: "i-custom:genshin",
        title: "Genshin",
      },
      {
        description: "Click. Upgrade. Repeat.",
        href: RoutePath.Clicker,
        icon: "i-mdi:cursor-pointer",
        title: "Clicker",
      },
      {
        description: "A little pixel dungeon to explore.",
        href: RoutePath.Dungeons,
        icon: "i-custom:dungeon-gate",
        title: "Dungeons",
      },
    ],
    title: "Play",
  },
  {
    items: [
      {
        description: "Characters drawn with nothing but graphing-calculator curves.",
        href: RoutePath.Anime,
        icon: "i-custom:anime",
        title: "Anime",
      },
      {
        description: "Water you can push around, lit by a moving sky.",
        href: RoutePath.FluidSimulator,
        icon: "i-mdi:water",
        title: "Fluid Simulator",
      },
    ],
    title: "Labs",
  },
] as const satisfies ProductGroup[];
