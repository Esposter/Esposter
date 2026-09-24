<script setup lang="ts">
import type { UiCommand } from "@/models/ui/UiCommand";

import { COMMAND_PALETTE_SHORTCUT, GENERAL_COMMAND_GROUP, PLACES_COMMAND_GROUP } from "@/services/app/constants";
import { getPageIcon } from "@/services/app/getPageIcon";
import { getPageLabel } from "@/services/app/getPageLabel";
import { ProductGroups } from "@/services/app/ProductGroups";
import { runCommand } from "@/services/ui/runCommand";
import { useBookmarkStore } from "@/store/bookmark";
import { useCommandStore } from "@/store/ui/command";
import { RoutePath, SITE_NAME } from "@esposter/shared";
import MiniSearch from "minisearch";

const commandStore = useCommandStore();
const { commands, isCommandPaletteOpen, isScoped, isShortcutsDialogOpen, scope } = storeToRefs(commandStore);
const { openCommandPalette } = commandStore;
const bookmarkStore = useBookmarkStore();
const { bookmarks } = storeToRefs(bookmarkStore);
const unbookmarkedRecentPages = useUnbookmarkedRecentPages();
const accountCommands = await useAccountCommands();
const query = ref("");
// The palette searches the scope's own query while it is in one, and its own otherwise
const fieldQuery = computed({
  get: () => (isScoped.value && scope.value ? scope.value.query.value : query.value),
  set: (newFieldQuery) => {
    if (isScoped.value && scope.value) scope.value.query.value = newFieldQuery;
    else query.value = newFieldQuery;
  },
});
// What the palette can reach or run, leaving out the keys surfaces handle themselves
const offeredCommands = computed(() => commands.value.filter(({ run, to }) => run || to));
// The titles are already in memory, so they are searched on the client, keyed by position since a page can be both a
// Product and one of the reader's places
const miniSearch = computed(() => {
  const index = new MiniSearch<{ description: string; id: number; title: string }>({
    fields: ["title", "description"],
    searchOptions: { boost: { title: 2 }, combineWith: "AND", prefix: true },
  });
  index.addAll(
    offeredCommands.value.map(({ description = "", title }, commandIndex) => ({
      description,
      id: commandIndex,
      title,
    })),
  );
  return index;
});
const foundCommands = computed(() => {
  if (isScoped.value && scope.value) return scope.value.commands();
  else if (!query.value) return offeredCommands.value;
  // Kept in the order they were registered, so each group stays together under its heading
  const foundIndexes = new Set(miniSearch.value.search(query.value).map(({ id }) => id));
  return offeredCommands.value.filter((_command, commandIndex) => foundIndexes.has(commandIndex));
});

useCommands(() => [
  { group: SITE_NAME, icon: "i-mdi:home", id: RoutePath.Index, title: "Home", to: RoutePath.Index },
  ...ProductGroups.flatMap(({ items, title }) =>
    items.map(({ href, icon, title: itemTitle }) => ({ group: title, icon, id: href, title: itemTitle, to: href })),
  ),
  // The reader's places, as the dock keeps them: bookmarks, then the pages they come back to most
  // oxlint-disable-next-line oxc/no-map-spread -- each command is a new object, never a result mutated in place
  ...[...bookmarks.value, ...unbookmarkedRecentPages.value].map(({ path, title }): UiCommand => {
    const icon = getPageIcon(path);
    return {
      group: PLACES_COMMAND_GROUP,
      id: `${PLACES_COMMAND_GROUP}${path}`,
      title: getPageLabel(path, title),
      to: path,
      ...(icon ? { icon } : { image: "" }),
    };
  }),
  ...accountCommands.value,
  { group: GENERAL_COMMAND_GROUP, id: "command-palette", shortcut: COMMAND_PALETTE_SHORTCUT, title: "Command palette" },
  {
    group: GENERAL_COMMAND_GROUP,
    icon: "i-mdi:keyboard",
    id: "keyboard-shortcuts",
    run: () => {
      isShortcutsDialogOpen.value = true;
    },
    shortcut: "shift+?",
    title: "Keyboard shortcuts",
  },
  { group: GENERAL_COMMAND_GROUP, id: "dismiss", shortcut: "escape", title: "Dismiss or close" },
]);
// The palette binds its own key rather than offering itself, and in a field too, since no typing holds Ctrl
useVHotkey(
  COMMAND_PALETTE_SHORTCUT,
  () => {
    if (isCommandPaletteOpen.value) isCommandPaletteOpen.value = false;
    else openCommandPalette();
  },
  { inputs: true },
);

watch(isCommandPaletteOpen, (newIsCommandPaletteOpen) => {
  if (newIsCommandPaletteOpen) query.value = "";
});
</script>

<template>
  <UiDialog v-model="isCommandPaletteOpen" title="Command palette" is-title-hidden max-w-150 w-full>
    <!-- Client-only, as the recent pages among its commands live in this browser's storage. Backspace on an empty
      Query steps out of a surface's search into the whole app's -->
    <ClientOnly>
      <UiCommandList
        v-model:query="fieldQuery"
        :commands="foundCommands"
        label="Command palette"
        :placeholder="isScoped && scope ? scope.placeholder : 'Search pages and commands'"
        @keydown.backspace="
          () => {
            if (isScoped && !fieldQuery) isScoped = false;
          }
        "
        @select="
          async (command) => {
            isCommandPaletteOpen = false;
            if (isScoped) scope?.onSelect?.();
            // A command with somewhere to go is a link the click already followed
            if (!command.to) await runCommand(command);
          }
        "
      >
        <template v-if="isScoped && scope" #prepend>
          <span text-sm px-2 py-1 shrink-0 ui-raised>{{ scope.title }}</span>
          <UiSpinner v-if="scope.isPending?.()" />
        </template>
        <template #append>
          <p v-if="foundCommands.length === 0 && fieldQuery" text-muted px-3 py-2>No results for "{{ fieldQuery }}"</p>
          <StyledWaypoint
            v-if="isScoped && scope?.readMore"
            :is-active="scope.hasMore?.() ?? false"
            @change="scope.readMore"
          >
            <UiSpinner px-3 />
          </StyledWaypoint>
        </template>
      </UiCommandList>
    </ClientOnly>
  </UiDialog>
</template>
