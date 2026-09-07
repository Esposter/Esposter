<script setup lang="ts">
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
    <!-- Plain wrapper: a bare v-input in a flex column stretches to the full column height -->
    <div>
      <v-text-field v-model="searchQuery" placeholder="Search by name" clearable @click:clear="searchQuery = ''" />
    </div>
    <v-list v-if="searchResults.length > 0" rd>
      <MessageFriendsSearchResultListItem v-for="{ id, name, image } of searchResults" :id :key="id" :image :name />
    </v-list>
    <v-progress-linear v-if="isPending" indeterminate />
  </MessageFriendsSection>
</template>
