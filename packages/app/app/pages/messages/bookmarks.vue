<script setup lang="ts">
import { useBookmarkStore } from "@/store/message/bookmark";
import { RoutePath } from "@esposter/shared";

definePageMeta({ middleware: "auth" });

const { readBookmarks, readMoreBookmarks } = useReadBookmarks();
const bookmarkStore = useBookmarkStore();
const { hasMore, items } = storeToRefs(bookmarkStore);
const { deleteBookmark } = bookmarkStore;
await readBookmarks();

const parseBookmarkRowKey = (rowKey: string) => {
  const separatorIndex = rowKey.indexOf("|");
  return {
    messageRowKey: rowKey.slice(separatorIndex + 1),
    roomId: rowKey.slice(0, separatorIndex),
  };
};
</script>

<template>
  <NuxtLayout hide-global-scrollbar>
    <template #left>
      <MessageLeftSideBar />
    </template>
    <div class="bg-surface" flex flex-col h-full overflow-y-auto>
      <v-container>
        <div class="text-headline-small" font-bold mb-6>Saved Messages</div>
        <v-list v-if="items.length > 0" rd>
          <v-list-item
            v-for="{ rowKey } of items"
            :key="rowKey"
            :to="
              RoutePath.MessagesMessage(parseBookmarkRowKey(rowKey).roomId, parseBookmarkRowKey(rowKey).messageRowKey)
            "
          >
            <template #append>
              <v-btn
                icon="mdi-bookmark-remove"
                variant="text"
                size="small"
                color="error"
                @click.prevent="
                  deleteBookmark(parseBookmarkRowKey(rowKey).roomId, parseBookmarkRowKey(rowKey).messageRowKey)
                "
              />
            </template>
            <v-list-item-subtitle class="text-medium-emphasis">
              Room: {{ parseBookmarkRowKey(rowKey).roomId }}
            </v-list-item-subtitle>
          </v-list-item>
          <StyledWaypoint :is-active="hasMore" @change="readMoreBookmarks" />
        </v-list>
        <span v-else class="text-medium-emphasis">No saved messages yet.</span>
      </v-container>
    </div>
  </NuxtLayout>
</template>
