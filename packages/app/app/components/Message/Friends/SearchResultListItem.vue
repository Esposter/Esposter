<script setup lang="ts">
import { FRIENDS_ACTION_BUTTON_PROPS } from "@/services/message/friend/constants";
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
      <div flex gap-x-2>
        <v-btn
          v-if="!isFriend && !hasSentFriendRequest"
          :="FRIENDS_ACTION_BUTTON_PROPS"
          text="Send Request"
          @click="sendFriendRequest(id)"
        />
        <v-chip v-else-if="hasSentFriendRequest" size="small" text="Request Sent" />
        <v-chip v-else color="success" size="small" text="Friends" />
        <MessageFriendsBlockUserButton v-if="!isBlocked" :user-id="id" />
      </div>
    </template>
  </MessageFriendsUserListItem>
</template>
