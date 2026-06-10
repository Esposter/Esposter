<script setup lang="ts">
import { useBlockStore } from "@/store/message/user/block";
import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";
import { withFinalizerAsync } from "@esposter/shared";

const { $trpc } = useNuxtApp();
const blockStore = useBlockStore();
const { blockedUsers } = storeToRefs(blockStore);
const { blockUser } = blockStore;
const friendRequestStore = useFriendRequestStore();
const { sentFriendRequests } = storeToRefs(friendRequestStore);
const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const searchQuery = ref("");
const searchResults = ref<Awaited<ReturnType<typeof $trpc.friend.searchUsers.query>>>([]);
const isSearching = ref(false);
const isFriend = (userId: string) => friends.value.some(({ id }) => id === userId);
const hasSentRequest = (userId: string) => sentFriendRequests.value.some(({ receiverId }) => receiverId === userId);
const isBlocked = (userId: string) => blockedUsers.value.some(({ id }) => id === userId);
const onSearch = async () => {
  if (!searchQuery.value) {
    searchResults.value = [];
    return;
  }
  isSearching.value = true;
  await withFinalizerAsync(
    async () => {
      searchResults.value = await $trpc.friend.searchUsers.query(searchQuery.value);
    },
    () => {
      isSearching.value = false;
    },
  );
};
</script>

<template>
  <div mb-8>
    <div mb-3 text-title-large>Add Friend</div>
    <div flex gap-2>
      <v-text-field
        v-model="searchQuery"
        placeholder="Search by name"
        hide-details
        clearable
        @input="onSearch"
        @click:clear="searchResults = []"
      />
    </div>
    <v-list v-if="searchResults.length > 0" mt-2 rd>
      <v-list-item v-for="{ id, name, image } of searchResults" :key="id" :title="name">
        <template #prepend>
          <v-avatar size="36" mr-3>
            <v-img v-if="image" :src="image" />
            <span v-else>{{ name[0] }}</span>
          </v-avatar>
        </template>
        <template #append>
          <div flex gap-2>
            <v-btn
              v-if="!isFriend(id) && !hasSentRequest(id)"
              text="Send Request"
              variant="tonal"
              size="small"
              @click="$trpc.friendRequest.sendFriendRequest.mutate(id)"
            />
            <v-chip v-else-if="hasSentRequest(id)" text="Request Sent" size="small" />
            <v-chip v-else text="Friends" size="small" color="success" />
            <v-btn
              v-if="!isBlocked(id)"
              text="Block"
              variant="tonal"
              color="error"
              size="small"
              @click="blockUser(id)"
            />
          </div>
        </template>
      </v-list-item>
    </v-list>
    <v-progress-linear v-if="isSearching" indeterminate mt-2 />
  </div>
</template>
