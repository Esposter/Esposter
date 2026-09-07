import type { ListLinkItem } from "@/models/shared/ListLinkItem";

import { RoutePath } from "@esposter/shared";

export const MoreDropdownLinkItems = [
  {
    href: RoutePath.Achievements,
    icon: "mdi-trophy",
    title: "Achievements",
  },
  {
    href: RoutePath.Anime,
    icon: "custom:anime",
    title: "Anime",
  },
  {
    href: RoutePath.FluidSimulator,
    icon: "mdi-water",
    title: "Fluid Simulator",
  },
  {
    href: RoutePath.About,
    icon: "mdi-information",
    title: "About",
  },
  {
    href: RoutePath.Docs,
    icon: "mdi-book-open-page-variant",
    title: "Documentation",
  },
  {
    href: RoutePath.PrivacyPolicy,
    icon: "mdi-lock",
    title: "Privacy Policy",
  },
  {
    external: true,
    href: RoutePath.Github,
    icon: "mdi-github",
    title: "Github",
  },
] as const satisfies ListLinkItem[];
