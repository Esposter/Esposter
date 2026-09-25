// @unocss-include
import type { UiCommand } from "@/models/ui/UiCommand";

import { ThemeModes } from "@/models/ui/ThemeMode";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiStyle, UiStyles } from "@/models/ui/UiStyle";
import {
  ACCOUNT_COMMAND_GROUP,
  PAGES_COMMAND_GROUP,
  STYLE_COMMAND_GROUP,
  THEME_COMMAND_GROUP,
} from "@/services/app/constants";
import { SecondaryPageLinkItems } from "@/services/app/SecondaryPageLinkItems";
import { UserSettingsPageLinkItem } from "@/services/app/UserSettingsPageLinkItem";
import { authClient } from "@/services/auth/authClient";
import { signOutOfBrowser } from "@/services/auth/signOutOfBrowser";
import { ThemeModeIconMeaningMap } from "@/services/ui/ThemeModeIconMeaningMap";
import { ThemeModeTitleMap } from "@/services/ui/ThemeModeTitleMap";
import { useReadableTextStore } from "@/store/ui/readableText";
import { useUiStyleStore } from "@/store/ui/style";
import { useThemeModeStore } from "@/store/ui/themeMode";
import { capitalize, RoutePath } from "@esposter/shared";

// The rarely used, which the dock's account menu keeps behind one step and the palette offers by name: the reader's
// Settings, the theme mode and the design style, the pages outside the products, and signing in or out. Signed out,
// Signing in leads. A mode and a style are choices, so each lists every member with the chosen one marked
export const useAccountCommands = async () => {
  // Before the await, which leaves the component's setup context behind
  const themeModeStore = useThemeModeStore();
  const { themeMode } = storeToRefs(themeModeStore);
  const readableTextStore = useReadableTextStore();
  const { toggleReadableText } = readableTextStore;
  const { isReadableText } = storeToRefs(readableTextStore);
  const uiStyleStore = useUiStyleStore();
  const { uiStyle } = storeToRefs(uiStyleStore);
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
    ...ThemeModes.map((mode) => ({
      group: THEME_COMMAND_GROUP,
      id: `${THEME_COMMAND_GROUP}${mode}`,
      isSelected: mode === themeMode.value,
      meaning: ThemeModeIconMeaningMap[mode],
      run: () => {
        themeMode.value = mode;
      },
      title: ThemeModeTitleMap[mode],
    })),
    ...UiStyles.map((style) => ({
      group: STYLE_COMMAND_GROUP,
      id: `${STYLE_COMMAND_GROUP}${style}`,
      isSelected: style === uiStyle.value,
      meaning: UiIconMeaning.Style,
      run: () => {
        uiStyle.value = style;
      },
      title: capitalize(style),
    })),
    // Only the voxel style's body face is a pixel one, so the setting is offered only while it is drawn; its cookie
    // Stays, so switching back restores it
    ...(uiStyle.value === UiStyle.Voxel
      ? [
          {
            description: isReadableText.value ? "On" : "Off",
            group: STYLE_COMMAND_GROUP,
            id: "readable-text",
            meaning: UiIconMeaning.ReadableText,
            run: () => {
              toggleReadableText();
            },
            title: "Readable text",
          },
        ]
      : []),
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
