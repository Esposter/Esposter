// @unocss-include
import type { ListLinkItem } from "@/models/shared/ListLinkItem";

import { RoutePath } from "@esposter/shared";

export const MoreDropdownLinkItems = [
  { href: RoutePath.Achievements, icon: "i-mdi:trophy", title: "Achievements" },
  { href: RoutePath.Anime, icon: "custom:anime", title: "Anime" },
  { href: RoutePath.FluidSimulator, icon: "i-mdi:water", title: "Fluid Simulator" },
  { href: RoutePath.About, icon: "i-mdi:information", title: "About" },
  { href: RoutePath.Docs, icon: "i-mdi:book-open-page-variant", title: "Documentation" },
  { href: RoutePath.PrivacyPolicy, icon: "i-mdi:lock", title: "Privacy Policy" },
  { external: true, href: RoutePath.Github, icon: "i-mdi:github", title: "Github" },
] as const satisfies ListLinkItem[];
