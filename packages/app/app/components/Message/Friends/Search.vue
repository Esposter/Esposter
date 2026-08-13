<script setup lang="ts">
import { useBlockStore } from "@/store/message/user/block";
import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

const { $trpc } = useNuxtApp();
const blockStore = useBlockStore();
const { blockedUsers } = storeToRefs(blockStore);
const { blockUser } = blockStore;
const friendRequestStore = useFriendRequestStore();
const { getHasSentFriendRequest, sendFriendRequest } = friendRequestStore;
const friendStore = useFriendStore();
const { getIsFriend } = friendStore;
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
const checkIsBlocked = (userId: string) => blockedUsers.value.some(({ id }) => id === userId);
</script>

<template>
  <MessageFriendsSection title="Add Friend">
    <!-- Plain wrapper: a bare v-input in a flex column stretches to the full column height -->
    <div>
      <v-text-field
        v-model="searchQuery"
        placeholder="Search by name"
        hide-details
        clearable
        @click:clear="searchQuery = ''"
      />
    </div>
    <v-list v-if="searchResults.length > 0" rd>
      <MessageFriendsUserListItem v-for="{ id, name, image } of searchResults" :key="id" :image :name>
        <template #append>
          <div flex gap-x-2>
            <v-btn
              v-if="!getIsFriend(id) && !getHasSentFriendRequest(id)"
              size="small"
              text="Send Request"
              variant="tonal"
              @click="sendFriendRequest(id)"
            />
            <v-chip v-else-if="getHasSentFriendRequest(id)" size="small" text="Request Sent" />
            <v-chip v-else color="success" size="small" text="Friends" />
            <v-btn
              v-if="!checkIsBlocked(id)"
              color="error"
              size="small"
              text="Block"
              variant="tonal"
              @click="blockUser(id)"
            />
          </div>
        </template>
      </MessageFriendsUserListItem>
    </v-list>
    <v-progress-linear v-if="isPending" indeterminate />
  </MessageFriendsSection>
</template>
