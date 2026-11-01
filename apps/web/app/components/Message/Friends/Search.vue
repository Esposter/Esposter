<script setup lang="ts">
import { UiTextFieldType } from "@/models/ui/UiTextFieldType";

const { $trpc } = useNuxtApp();
const searchQuery = ref("");
const searchResults = ref<Awaited<ReturnType<typeof $trpc.friend.searchUsers.query>>>([]);
const { isPending } = useAutoSearch(searchQuery, {
  reset: () => {
    searchResults.value = [];
  },
  search: async (sanitizedSearchQuery, signal) => {
    searchResults.value = await $trpc.friend.searchUsers.query(sanitizedSearchQuery, { signal });
  },
});
</script>

<template>
  <MessageFriendsSection title="Add Friend">
    <UiTextField v-model="searchQuery" label="Search by name" :type="UiTextFieldType.Search" />
    <ul v-if="searchResults.length > 0" flex flex-col>
      <MessageFriendsSearchResultListItem v-for="{ id, name, image } of searchResults" :id :key="id" :image :name />
    </ul>
    <!-- The first search on its way: rows in the results' own shape, where a later one keeps the rows it replaces -->
    <MessageFriendsListSkeleton v-else-if="isPending" />
  </MessageFriendsSection>
</template>
