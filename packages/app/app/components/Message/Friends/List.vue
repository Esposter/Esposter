<script setup lang="ts">
import { useFriendStore } from "@/store/message/user/friend";

const friendStore = useFriendStore();
const { friends } = storeToRefs(friendStore);
const displayFriends = computed(() =>
  friends.value.toSorted(
    (firstFriend, secondFriend) => secondFriend.createdAt.getTime() - firstFriend.createdAt.getTime(),
  ),
);
</script>

<template>
  <MessageFriendsSection :title="`Friends — ${displayFriends.length}`">
    <v-list v-if="displayFriends.length > 0" rd>
      <MessageFriendsUserListItem v-for="{ id, name, image } of displayFriends" :key="id" :image :name>
        <template #append>
          <div flex gap-x-2>
            <MessageFriendsRemoveFriendButton :user-id="id" />
            <MessageFriendsBlockUserButton :user-id="id" />
          </div>
        </template>
      </MessageFriendsUserListItem>
    </v-list>
    <span v-else op-medium-emphasis>No friends yet. Search for users above to add them.</span>
  </MessageFriendsSection>
</template>
