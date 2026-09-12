<script setup lang="ts">
import { compareCreatedAt } from "#shared/util/date/compareCreatedAt";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

const friendRequestStore = useFriendRequestStore();
const { receivedFriendRequests } = storeToRefs(friendRequestStore);
const displayReceivedFriendRequests = computed(() =>
  receivedFriendRequests.value.toSorted((firstFriendRequest, secondFriendRequest) =>
    compareCreatedAt(secondFriendRequest, firstFriendRequest),
  ),
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
            <MessageFriendsAcceptFriendRequestButton :sender />
            <MessageFriendsDeclineFriendRequestButton :user-id="sender.id" />
          </div>
        </template>
      </MessageFriendsUserListItem>
    </v-list>
  </MessageFriendsSection>
</template>
