<script setup lang="ts">
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

const friendRequestStore = useFriendRequestStore();
const { acceptFriendRequest, declineFriendRequest } = friendRequestStore;
const { receivedFriendRequests } = storeToRefs(friendRequestStore);
const displayReceivedFriendRequests = computed(() =>
  receivedFriendRequests.value.toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
);
</script>

<template>
  <MessageFriendsSection
    v-if="displayReceivedFriendRequests.length > 0"
    :title="`Pending Requests — ${displayReceivedFriendRequests.length}`"
  >
    <v-list rd>
      <MessageFriendsUserListItem
        v-for="{ id, sender } of displayReceivedFriendRequests"
        :key="id"
        :image="sender.image"
        :name="sender.name"
      >
        <template #append>
          <div flex gap-x-2>
            <v-btn text="Accept" variant="tonal" color="success" size="small" @click="acceptFriendRequest(sender)" />
            <v-btn text="Decline" variant="tonal" color="error" size="small" @click="declineFriendRequest(sender.id)" />
          </div>
        </template>
      </MessageFriendsUserListItem>
    </v-list>
  </MessageFriendsSection>
</template>
