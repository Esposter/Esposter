import type { UiCommand } from "#src/models/ui/UiCommand";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { COMMAND_PALETTE_SHORTCUT, GENERAL_COMMAND_GROUP } from "#src/services/app/constants";
import { getPlaceCommand } from "#src/services/app/getPlaceCommand";
import { ProductGroups } from "#src/services/app/ProductGroups";
import { useBookmarkStore } from "#src/store/bookmark";
import { useCommandStore } from "#src/store/ui/command";
import { RoutePath, SITE_NAME } from "@esposter/shared";

// The commands the palette offers beside a surface's own: the pages, the reader's places, the theme, the style, the
// Account and the palette's own keys. The account commands come in already awaited, since they wait on the session
export const useAppCommands = (accountCommands: ComputedRef<UiCommand[]>) => {
  const bookmarkStore = useBookmarkStore();
  const { displayBookmarks } = storeToRefs(bookmarkStore);
  const unbookmarkedRecentPages = useUnbookmarkedRecentPages();
  const themeModeCommands = useThemeModeCommands();
  const uiStyleCommands = useUiStyleCommands();
  const commandStore = useCommandStore();
  const { isShortcutsDialogOpen } = storeToRefs(commandStore);

  useCommands(() => [
    { group: SITE_NAME, id: RoutePath.Index, meaning: UiIconMeaning.Home, title: "Home", to: RoutePath.Index },
    ...ProductGroups.flatMap(({ items, title }) =>
      items.map(({ href, icon, title: itemTitle }) => ({ group: title, icon, id: href, title: itemTitle, to: href })),
    ),
    // The reader's places, as the dock keeps them: bookmarks, then the pages they come back to most
    ...displayBookmarks.value.map((bookmark) => getPlaceCommand(bookmark, bookmark.isAvailable)),
    ...unbookmarkedRecentPages.value.map((recentPage) => getPlaceCommand(recentPage, true)),
    ...themeModeCommands.value,
    ...uiStyleCommands.value,
    ...accountCommands.value,
    {
      group: GENERAL_COMMAND_GROUP,
      id: "command-palette",
      meaning: UiIconMeaning.Command,
      shortcut: COMMAND_PALETTE_SHORTCUT,
      title: "Command palette",
    },
    {
      group: GENERAL_COMMAND_GROUP,
      id: "keyboard-shortcuts",
      meaning: UiIconMeaning.Keyboard,
      run: () => {
        isShortcutsDialogOpen.value = true;
      },
      shortcut: "shift+?",
      title: "Keyboard shortcuts",
    },
    {
      group: GENERAL_COMMAND_GROUP,
      id: "dismiss",
      meaning: UiIconMeaning.Close,
      shortcut: "escape",
      title: "Dismiss or close",
    },
  ]);
};
