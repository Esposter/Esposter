<script setup lang="ts">
import { useBookmarkStore } from "@/store/message/bookmark";
import { ID_SEPARATOR, RoutePath } from "@esposter/shared";

definePageMeta({ middleware: "auth" });

const { readBookmarks, readMoreBookmarks } = useReadBookmarks();
const bookmarkStore = useBookmarkStore();
const { displayItems, hasMore } = storeToRefs(bookmarkStore);
const { deleteBookmark } = bookmarkStore;
const parseBookmarkRowKey = (rowKey: string) => {
  const separatorIndex = rowKey.indexOf(ID_SEPARATOR);
  return {
    messageRowKey: rowKey.slice(separatorIndex + 1),
    roomId: rowKey.slice(0, separatorIndex),
  };
};

await readBookmarks();
</script>

<template>
  <NuxtLayout hide-global-scrollbar>
    <template #left>
      <MessageLeftSideBar />
    </template>
    <div class="bg-surface" flex flex-col h-full overflow-y-auto>
      <v-container>
        <div class="text-headline-small" font-bold mb-6>Saved Messages</div>
        <v-list v-if="displayItems.length > 0" rd>
          <MessageModelMessageBookmarkListItem
            v-for="{ rowKey, message, creator } of displayItems"
            :key="rowKey"
            :creator
            :message
            :to="
              RoutePath.MessagesMessage(parseBookmarkRowKey(rowKey).roomId, parseBookmarkRowKey(rowKey).messageRowKey)
            "
            @delete="deleteBookmark(parseBookmarkRowKey(rowKey).roomId, parseBookmarkRowKey(rowKey).messageRowKey)"
          />
          <StyledWaypoint :is-active="hasMore" @change="readMoreBookmarks" />
        </v-list>
        <span v-else class="text-medium-emphasis">No saved messages yet.</span>
      </v-container>
    </div>
  </NuxtLayout>
</template>
