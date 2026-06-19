<script setup lang="ts">
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

const { $trpc } = useNuxtApp();
const friendRequestStore = useFriendRequestStore();
const { receivedFriendRequests } = storeToRefs(friendRequestStore);
const displayReceivedFriendRequests = computed(() =>
  receivedFriendRequests.value.toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
);
</script>

<template>
  <div v-if="displayReceivedFriendRequests.length > 0" mb-8>
    <div mb-3 text-title-large>Pending Requests — {{ displayReceivedFriendRequests.length }}</div>
    <v-list rd>
      <MessageFriendsUserListItem
        v-for="{ id, sender } of displayReceivedFriendRequests"
        :key="id"
        :image="sender.image"
        :name="sender.name"
      >
        <template #append>
          <div flex gap-2>
            <v-btn
              text="Accept"
              variant="tonal"
              color="success"
              size="small"
              @click="$trpc.friendRequest.acceptFriendRequest.mutate(sender.id)"
            />
            <v-btn
              text="Decline"
              variant="tonal"
              color="error"
              size="small"
              @click="$trpc.friendRequest.declineFriendRequest.mutate(sender.id)"
            />
          </div>
        </template>
      </MessageFriendsUserListItem>
    </v-list>
  </div>
</template>
