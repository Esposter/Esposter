<script setup lang="ts">
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { runCommand } from "#src/services/ui/runCommand";
import { useCommandStore } from "#src/store/ui/command";
import MiniSearch from "minisearch";

const commandStore = useCommandStore();
const { commands, isCommandPaletteOpen, isScoped, scope } = storeToRefs(commandStore);
const { openCommandPalette } = commandStore;
const accountCommands = await useAccountCommands();
useAppCommands(accountCommands);
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

useCommandPaletteShortcut(() => {
  if (isCommandPaletteOpen.value) isCommandPaletteOpen.value = false;
  else openCommandPalette();
});

watch(isCommandPaletteOpen, (newIsCommandPaletteOpen) => {
  if (newIsCommandPaletteOpen) query.value = "";
});
</script>

<template>
  <UiDialog v-model="isCommandPaletteOpen" title="Command palette" is-title-hidden is-body-bare max-w-150 w-full>
    <!-- Client-only, as the recent pages among its commands live in this browser's storage. Backspace on an empty
      Query steps out of a surface's search into the whole app's -->
    <ClientOnly>
      <UiCommandList
        v-model:query="fieldQuery"
        :commands="foundCommands"
        label="Command palette"
        :placeholder="isScoped && scope ? scope.placeholder : 'Search pages and commands'"
        @keydown.backspace="() => {
          if (isScoped && !fieldQuery) isScoped = false;
        }"
        @select="async (command) => {
          isCommandPaletteOpen = false;
          if (isScoped) scope?.onSelect?.();
          // A command with somewhere to go is a link the click already followed
          if (!command.to) await runCommand(command);
        }"
      >
        <template v-if="isScoped && scope" #prepend>
          <UiChip shrink-0>{{ scope.title }}</UiChip>
          <UiSpinner v-if="scope.checkIsPending?.()" />
        </template>
        <template #append>
          <!-- A scope's first read draws its rows' shape rather than saying it found nothing while the read is out -->
          <template v-if="foundCommands.length === 0">
            <div v-if="isScoped && scope?.checkIsPending?.()" aria-hidden="true" px-2 flex flex-col gap-1>
              <UiSkeleton v-for="index of 3" :key="index" h-8 />
            </div>
            <UiEmptyState
              v-else-if="fieldQuery"
              :meaning="UiIconMeaning.Search"
              :title="`No results for “${fieldQuery}”`"
            />
          </template>
          <StyledWaypoint
            v-if="isScoped && scope?.readMore"
            :is-active="scope.checkHasMore?.() ?? false"
            @change="(onComplete: () => void) => scope?.readMore?.(onComplete)"
          >
            <UiSpinner px-3 />
          </StyledWaypoint>
        </template>
      </UiCommandList>
    </ClientOnly>
  </UiDialog>
</template>
