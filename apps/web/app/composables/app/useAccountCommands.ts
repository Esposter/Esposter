// @unocss-include
import type { UiCommand } from "@/models/ui/UiCommand";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { ACCOUNT_COMMAND_GROUP, PAGES_COMMAND_GROUP } from "@/services/app/constants";
import { SecondaryPageLinkItems } from "@/services/app/SecondaryPageLinkItems";
import { UserSettingsPageLinkItem } from "@/services/app/UserSettingsPageLinkItem";
import { authClient } from "@/services/auth/authClient";
import { signOutOfBrowser } from "@/services/auth/signOutOfBrowser";
import { RoutePath } from "@esposter/shared";

// The rarely used, which the dock's account menu keeps behind one step and the palette offers by name: the reader's
// Settings, the pages outside the products, and signing in or out. Signed out, signing in leads. The theme mode and
// The design style are the dock's menus of their own (`useThemeModeCommands`, `useUiStyleCommands`)
export const useAccountCommands = async () => {
  const { data: session } = await authClient.useSession(useFetch);
  return computed<UiCommand[]>(() => [
    ...(session.value
      ? [
          {
            group: ACCOUNT_COMMAND_GROUP,
            id: UserSettingsPageLinkItem.href,
            meaning: UiIconMeaning.Settings,
            title: UserSettingsPageLinkItem.title,
            to: UserSettingsPageLinkItem.href,
          },
          {
            group: ACCOUNT_COMMAND_GROUP,
            id: "sign-out",
            meaning: UiIconMeaning.SignOut,
            run: () => signOutOfBrowser(),
            title: "Sign out",
          },
        ]
      : [
          {
            group: ACCOUNT_COMMAND_GROUP,
            id: RoutePath.Login,
            meaning: UiIconMeaning.SignIn,
            title: "Sign in",
            to: RoutePath.Login,
          },
        ]),
    // oxlint-disable-next-line oxc/no-map-spread -- each command is a new object, never a result mutated in place
    ...SecondaryPageLinkItems.map((item) => ({
      group: PAGES_COMMAND_GROUP,
      icon: item.icon,
      id: item.href,
      title: item.title,
      ...("external" in item
        ? {
            run: async () => {
              await navigateTo(item.href, { external: true, open: { target: "_blank" } });
            },
          }
        : { to: item.href }),
    })),
  ]);
};
