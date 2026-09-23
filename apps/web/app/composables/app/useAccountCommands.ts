// @unocss-include
import type { UiCommand } from "@/models/ui/UiCommand";
import type { ThemeMode } from "@/models/vuetify/ThemeMode";

import { SecondaryPageLinkItems } from "@/services/app/SecondaryPageLinkItems";
import { authClient } from "@/services/auth/authClient";
import { signOutOfBrowser } from "@/services/auth/signOutOfBrowser";
import { useReadableTextStore } from "@/store/ui/readableText";
import { ThemeModeIconMap } from "@/services/vuetify/ThemeModeIconMap";
import { ThemeModeTooltipMap } from "@/services/vuetify/ThemeModeTooltipMap";
import { RoutePath } from "@esposter/shared";

const ACCOUNT_GROUP = "Account";

// The rarely used, which the dock's account menu keeps behind one step and the palette offers by name: the reader's
// Settings, the theme, the pages outside the products, and signing in or out. Signed out, signing in leads
export const useAccountCommands = async () => {
  // Before the await, which leaves the component's setup context behind
  const { global } = useVTheme();
  const toggleTheme = useToggleTheme();
  const readableTextStore = useReadableTextStore();
  const { toggleReadableText } = readableTextStore;
  const { isReadableText } = storeToRefs(readableTextStore);
  const { data: session } = await authClient.useSession(useFetch);
  return computed<UiCommand[]>(() => {
    // Vuetify types its theme name as a bare string, while the themes it is given are exactly `ThemeMode`
    const currentTheme = global.name.value as ThemeMode;
    return [
      session.value
        ? {
            group: ACCOUNT_GROUP,
            icon: "i-mdi:cog",
            id: RoutePath.UserSettings,
            title: "Settings",
            to: RoutePath.UserSettings,
          }
        : { group: ACCOUNT_GROUP, icon: "i-mdi:login", id: RoutePath.Login, title: "Sign in", to: RoutePath.Login },
      {
        description: ThemeModeTooltipMap[currentTheme],
        group: ACCOUNT_GROUP,
        icon: ThemeModeIconMap[currentTheme],
        id: "theme",
        run: () => toggleTheme(),
        title: "Theme",
      },
      {
        description: isReadableText.value ? "On" : "Off",
        group: ACCOUNT_GROUP,
        icon: "i-mdi:format-font",
        id: "readable-text",
        run: () => {
          toggleReadableText();
        },
        title: "Readable text",
      },
      // oxlint-disable-next-line oxc/no-map-spread -- each command is a new object, never a result mutated in place
      ...SecondaryPageLinkItems.map((item) => ({
        group: ACCOUNT_GROUP,
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
      ...(session.value
        ? [
            {
              group: ACCOUNT_GROUP,
              icon: "i-mdi:logout",
              id: "sign-out",
              run: () => signOutOfBrowser(),
              title: "Sign out",
            },
          ]
        : []),
    ];
  });
};
