<script setup lang="ts">
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { UiTextFieldType } from "#src/models/ui/UiTextFieldType";
import { useUserSearchStore } from "#src/store/message/user/search";

const userSearchStore = useUserSearchStore();
const { hasMore, isError, isPending, items, searchQuery } = storeToRefs(userSearchStore);
const { readMoreSearchedItems, retry } = userSearchStore;
</script>

<template>
  <MessageFriendsSection title="Add Friend">
    <UiTextField v-model="searchQuery" label="Search by name" :type="UiTextFieldType.Search" />
    <!-- A failed search shows that rather than the rows of the query before it, which the field no longer says -->
    <UiErrorState v-if="isError" error="The users could not be searched." @retry="retry()" />
    <template v-else-if="items.length > 0">
      <ul flex flex-col>
        <MessageFriendsSearchResultListItem v-for="{ id, name, image } of items" :id :key="id" :image :name />
      </ul>
      <StyledWaypoint :is-active="hasMore" @change="(onComplete) => readMoreSearchedItems(onComplete)">
        <MessageFriendsListSkeleton />
      </StyledWaypoint>
    </template>
    <!-- The first search on its way: rows in the results' own shape, where a later one keeps the rows it replaces -->
    <MessageFriendsListSkeleton v-else-if="isPending" />
    <UiEmptyState
      v-else-if="searchQuery"
      description="No one goes by that name."
      :meaning="UiIconMeaning.Person"
      title="No users found"
    />
  </MessageFriendsSection>
</template>
