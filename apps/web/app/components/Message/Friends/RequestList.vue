<script setup lang="ts">
import { compareCreatedAt } from "#shared/util/date/compareCreatedAt";
import { useFriendRequestStore } from "#src/store/message/user/friendRequest";

const friendRequestStore = useFriendRequestStore();
const { friendRequestsError, receivedFriendRequests } = storeToRefs(friendRequestStore);
const readFriends = useReadFriends();
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
    <ul flex flex-col>
      <MessageFriendsUserListItem
        v-for="{ id, sender } of displayReceivedFriendRequests"
        :key="id"
        :image="sender.image"
        :name="sender.name"
      >
        <template #append>
          <MessageFriendsDeclineFriendRequestButton :user-id="sender.id" />
          <MessageFriendsAcceptFriendRequestButton :sender-id="sender.id" />
        </template>
      </MessageFriendsUserListItem>
    </ul>
  </MessageFriendsSection>
  <UiErrorState v-else-if="friendRequestsError" :error="friendRequestsError" @retry="readFriends()" />
</template>
