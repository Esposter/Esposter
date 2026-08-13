<script setup lang="ts">
import { useBlockStore } from "@/store/message/user/block";
import { useFriendStore } from "@/store/message/user/friend";

const blockStore = useBlockStore();
const { blockUser } = blockStore;
const friendStore = useFriendStore();
const { deleteFriend } = friendStore;
const { friends } = storeToRefs(friendStore);
const displayFriends = computed(() => friends.value.toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
</script>

<template>
  <MessageFriendsSection :title="`Friends — ${displayFriends.length}`">
    <v-list v-if="displayFriends.length > 0" rd>
      <MessageFriendsUserListItem v-for="{ id, name, image } of displayFriends" :key="id" :image :name>
        <template #append>
          <div flex gap-x-2>
            <v-btn color="error" size="small" text="Remove" variant="tonal" @click="deleteFriend(id)" />
            <v-btn color="error" size="small" text="Block" variant="tonal" @click="blockUser(id)" />
          </div>
        </template>
      </MessageFriendsUserListItem>
    </v-list>
    <span v-else op-medium-emphasis>No friends yet. Search for users above to add them.</span>
  </MessageFriendsSection>
</template>
