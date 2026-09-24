<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { useBlockStore } from "@/store/message/user/block";
import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

interface Props {
  id: string;
  image: null | string;
  name: string;
}

const { id, image, name } = defineProps<Props>();
const blockStore = useBlockStore();
const { blockedUsers } = storeToRefs(blockStore);
const friendRequestStore = useFriendRequestStore();
const { checkHasSentFriendRequest, sendFriendRequest } = friendRequestStore;
const friendStore = useFriendStore();
const { checkIsFriend } = friendStore;
const hasSentFriendRequest = computed(() => checkHasSentFriendRequest(id));
const isFriend = computed(() => checkIsFriend(id));
const isBlocked = computed(() => blockedUsers.value.some((blockedUser) => blockedUser.id === id));
</script>

<template>
  <MessageFriendsUserListItem :image :name>
    <template #append>
      <MessageFriendsBlockUserButton v-if="!isBlocked" :user-id="id" />
      <UiButton v-if="!isFriend && !hasSentFriendRequest" @click="sendFriendRequest(id)">Send Request</UiButton>
      <UiChip v-else-if="hasSentFriendRequest" :meaning="UiIconMeaning.Awaiting">Request Sent</UiChip>
      <UiChip v-else :meaning="UiIconMeaning.Success">Friends</UiChip>
    </template>
  </MessageFriendsUserListItem>
</template>
