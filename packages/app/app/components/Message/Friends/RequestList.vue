<script setup lang="ts">
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

const friendRequestStore = useFriendRequestStore();
const { receivedFriendRequests } = storeToRefs(friendRequestStore);
const { acceptFriendRequest, declineFriendRequest } = friendRequestStore;
const displayReceivedFriendRequests = computed(() =>
  receivedFriendRequests.value.toSorted((a, b) => b.createdAt.getTime() - a.createdAt.getTime()),
);
</script>

<template>
  <div v-if="displayReceivedFriendRequests.length > 0" mb-8>
    <div mb-3 text-title-large>Pending Requests — {{ displayReceivedFriendRequests.length }}</div>
    <v-list rd>
      <v-list-item v-for="{ id, sender } of displayReceivedFriendRequests" :key="id" :title="sender.name">
        <template #prepend>
          <v-avatar size="36" mr-3>
            <v-img v-if="sender.image" :src="sender.image" />
            <span v-else>{{ sender.name[0] }}</span>
          </v-avatar>
        </template>
        <template #append>
          <div flex gap-2>
            <v-btn text="Accept" variant="tonal" color="success" size="small" @click="acceptFriendRequest(sender.id)" />
            <v-btn text="Decline" variant="tonal" color="error" size="small" @click="declineFriendRequest(sender.id)" />
          </div>
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>
