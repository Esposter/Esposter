// @unocss-include
import type { ListLinkItem } from "#src/models/shared/ListLinkItem";

import { RoutePath } from "@esposter/shared";

// The pages outside the products, reached from the account menu
export const SecondaryPageLinkItems = [
  { href: RoutePath.Achievements, icon: "i-mdi:trophy", title: "Achievements" },
  { href: RoutePath.About, icon: "i-mdi:information", title: "About" },
  { href: RoutePath.PrivacyPolicy, icon: "i-mdi:lock", title: "Privacy Policy" },
  { external: true, href: RoutePath.Github, icon: "i-mdi:github", title: "Github" },
] as const satisfies ListLinkItem[];
