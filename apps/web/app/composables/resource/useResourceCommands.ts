// @unocss-include
import type { UiCommand } from "@/models/ui/UiCommand";

import { useNotificationStore } from "@/store/notification";
import { useCommandStore } from "@/store/ui/command";
import { RoutePath } from "@esposter/shared";

const RESOURCE_EXPLORER_GROUP = "Resource Explorer";

// The explorer's Azure-portal-style chords, and its search as the palette's scope: resources, services and pages as
// They are typed, and the recent searches and recently opened resources before anything is
export const useResourceCommands = () => {
  const commandStore = useCommandStore();
  const { openCommandPalette } = commandStore;
  const notificationStore = useNotificationStore();
  const { isPanelOpen: isNotificationPanelOpen } = storeToRefs(notificationStore);
  const searchQuery = ref("");
  const { addRecentSearch, isPending, items } = useResourceSearchItems(searchQuery);

  useCommands([
    {
      group: RESOURCE_EXPLORER_GROUP,
      icon: "i-mdi:magnify",
      id: "search-resources",
      run: () => {
        openCommandPalette();
      },
      shortcut: "g-/",
      title: "Search resources",
    },
    {
      group: RESOURCE_EXPLORER_GROUP,
      icon: "i-mdi:view-list",
      id: RoutePath.ResourceExplorerAll,
      shortcut: "g-a",
      title: "Go to All resources",
      to: RoutePath.ResourceExplorerAll,
    },
    {
      group: RESOURCE_EXPLORER_GROUP,
      icon: "i-mdi:bell",
      id: "open-notifications",
      run: () => {
        isNotificationPanelOpen.value = true;
      },
      shortcut: "g-n",
      title: "Open notifications",
    },
  ]);
  useCommandScope({
    commands: () => [
      // oxlint-disable-next-line oxc/no-map-spread -- each command is a new object, never a result mutated in place
      ...items.value.flatMap(({ createTo, group, icon, id, subtitle, title, to }): UiCommand[] => [
        { description: subtitle, group, icon, id, title, to },
        // A service can be created from its search result as well as opened
        ...(createTo ? [{ group, icon: "i-mdi:plus", id: `${id}create`, title: `Create ${title}`, to: createTo }] : []),
      ]),
      ...(searchQuery.value
        ? [
            {
              group: "All resources",
              icon: "i-mdi:arrow-right",
              id: "see-all",
              title: `See all results for "${searchQuery.value}"`,
              to: { path: RoutePath.ResourceExplorerAll, query: { search: searchQuery.value } },
            },
          ]
        : []),
    ],
    isPending: () => isPending.value,
    onSelect: () => {
      addRecentSearch(searchQuery.value);
    },
    placeholder: "Search resources, services, and pages",
    query: searchQuery,
    title: "Resources",
  });
};
