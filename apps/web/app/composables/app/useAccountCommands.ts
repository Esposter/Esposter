// @unocss-include
import type { UiCommand } from "@/models/ui/UiCommand";
import type { ThemeMode } from "@/models/vuetify/ThemeMode";

import { UiStyle, UiStyles } from "@/models/ui/UiStyle";
import { ACCOUNT_COMMAND_GROUP } from "@/services/app/constants";
import { SecondaryPageLinkItems } from "@/services/app/SecondaryPageLinkItems";
import { UserSettingsPageLinkItem } from "@/services/app/UserSettingsPageLinkItem";
import { authClient } from "@/services/auth/authClient";
import { signOutOfBrowser } from "@/services/auth/signOutOfBrowser";
import { ThemeModeIconMap } from "@/services/vuetify/ThemeModeIconMap";
import { ThemeModeTooltipMap } from "@/services/vuetify/ThemeModeTooltipMap";
import { useReadableTextStore } from "@/store/ui/readableText";
import { useUiStyleStore } from "@/store/ui/style";
import { capitalize, RoutePath, takeOne } from "@esposter/shared";

// The rarely used, which the dock's account menu keeps behind one step and the palette offers by name: the reader's
// Settings, the theme, the pages outside the products, and signing in or out. Signed out, signing in leads
export const useAccountCommands = async () => {
  // Before the await, which leaves the component's setup context behind
  const { global } = useVTheme();
  const toggleTheme = useToggleTheme();
  const readableTextStore = useReadableTextStore();
  const { toggleReadableText } = readableTextStore;
  const { isReadableText } = storeToRefs(readableTextStore);
  const uiStyleStore = useUiStyleStore();
  const { uiStyle } = storeToRefs(uiStyleStore);
  const { data: session } = await authClient.useSession(useFetch);
  return computed<UiCommand[]>(() => {
    // Vuetify types its theme name as a bare string, while the themes it is given are exactly `ThemeMode`
    const currentTheme = global.name.value as ThemeMode;
    return [
      session.value
        ? {
            group: ACCOUNT_COMMAND_GROUP,
            icon: UserSettingsPageLinkItem.icon,
            id: UserSettingsPageLinkItem.href,
            title: UserSettingsPageLinkItem.title,
            to: UserSettingsPageLinkItem.href,
          }
        : {
            group: ACCOUNT_COMMAND_GROUP,
            icon: "i-mdi:login",
            id: RoutePath.Login,
            title: "Sign in",
            to: RoutePath.Login,
          },
      {
        description: ThemeModeTooltipMap[currentTheme],
        group: ACCOUNT_COMMAND_GROUP,
        icon: ThemeModeIconMap[currentTheme],
        id: "theme",
        run: () => toggleTheme(),
        title: "Theme",
      },
      {
        description: capitalize(uiStyle.value),
        group: ACCOUNT_COMMAND_GROUP,
        icon: "i-mdi:palette-swatch-variant",
        id: "ui-style",
        run: () => {
          uiStyle.value = takeOne(UiStyles, (UiStyles.indexOf(uiStyle.value) + 1) % UiStyles.length);
        },
        title: "Style",
      },
      // Only the voxel style's body face is a pixel one, so the setting is offered only while it is drawn; its cookie
      // Stays, so switching back restores it
      ...(uiStyle.value === UiStyle.Voxel
        ? [
            {
              description: isReadableText.value ? "On" : "Off",
              group: ACCOUNT_COMMAND_GROUP,
              icon: isReadableText.value ? "i-mdi:alphabetical-variant" : "i-mdi:alphabetical-variant-off",
              id: "readable-text",
              run: () => {
                toggleReadableText();
              },
              title: "Readable text",
            },
          ]
        : []),
      // oxlint-disable-next-line oxc/no-map-spread -- each command is a new object, never a result mutated in place
      ...SecondaryPageLinkItems.map((item) => ({
        group: ACCOUNT_COMMAND_GROUP,
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
              group: ACCOUNT_COMMAND_GROUP,
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
