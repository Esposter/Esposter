// @unocss-include
import type { UiCommand } from "@/models/ui/UiCommand";

import { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { RESOURCE_EXPLORER_DISPLAY_NAME } from "@/services/resource/constants";
import { ResourceListSourceSearchTitleMap } from "@/services/resource/search/ResourceListSourceSearchTitleMap";
import { useNotificationStore } from "@/store/notification";
import { useCommandStore } from "@/store/ui/command";
import { ID_SEPARATOR, RoutePath } from "@esposter/shared";

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
      group: RESOURCE_EXPLORER_DISPLAY_NAME,
      id: "search-resources",
      meaning: UiIconMeaning.Search,
      run: () => {
        openCommandPalette();
      },
      shortcut: "g-/",
      title: "Search resources",
    },
    {
      group: RESOURCE_EXPLORER_DISPLAY_NAME,
      id: RoutePath.ResourceExplorerAll,
      meaning: UiIconMeaning.Rows,
      shortcut: "g-a",
      title: `Go to ${ResourceListSourceSearchTitleMap[ResourceListSource.All]}`,
      to: RoutePath.ResourceExplorerAll,
    },
    {
      group: RESOURCE_EXPLORER_DISPLAY_NAME,
      id: "open-notifications",
      meaning: UiIconMeaning.Notifications,
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
        ...(createTo
          ? [
              {
                group,
                id: `${id}${ID_SEPARATOR}create`,
                meaning: UiIconMeaning.Create,
                title: `Create ${title}`,
                to: createTo,
              },
            ]
          : []),
      ]),
      ...(searchQuery.value
        ? [
            {
              group: ResourceListSourceSearchTitleMap[ResourceListSource.All],
              id: "see-all",
              meaning: UiIconMeaning.Next,
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
