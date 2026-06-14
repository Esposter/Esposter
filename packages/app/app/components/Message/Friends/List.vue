<script setup lang="ts">
import { useBlockStore } from "@/store/message/user/block";
import { useFriendStore } from "@/store/message/user/friend";

const { $trpc } = useNuxtApp();
const blockStore = useBlockStore();
const { blockUser } = blockStore;
const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const displayFriends = computed(() => friends.value.toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
</script>

<template>
  <div mb-8>
    <div mb-3 text-title-large>Friends — {{ displayFriends.length }}</div>
    <v-list v-if="displayFriends.length > 0" rd>
      <MessageFriendsUserListItem v-for="{ id, name, image } of displayFriends" :key="id" :image :name>
        <template #append>
          <div flex gap-2>
            <v-btn
              text="Remove"
              variant="tonal"
              color="error"
              size="small"
              @click="$trpc.friend.deleteFriend.mutate(id)"
            />
            <v-btn text="Block" variant="tonal" color="error" size="small" @click="blockUser(id)" />
          </div>
        </template>
      </MessageFriendsUserListItem>
    </v-list>
    <span v-else op-medium-emphasis>No friends yet. Search for users above to add them.</span>
  </div>
</template>
