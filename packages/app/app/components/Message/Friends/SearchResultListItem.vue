<script setup lang="ts">
import { useBlockStore } from "@/store/message/user/block";
import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

interface SearchResultListItemProps {
  id: string;
  image: null | string;
  name: string;
}

const { id, image, name } = defineProps<SearchResultListItemProps>();
const blockStore = useBlockStore();
const { blockedUsers } = storeToRefs(blockStore);
const friendRequestStore = useFriendRequestStore();
const { getHasSentFriendRequest, sendFriendRequest } = friendRequestStore;
const friendStore = useFriendStore();
const { getIsFriend } = friendStore;
const hasSentFriendRequest = computed(() => getHasSentFriendRequest(id));
const isFriend = computed(() => getIsFriend(id));
const isBlocked = computed(() => blockedUsers.value.some((blockedUser) => blockedUser.id === id));
</script>

<template>
  <MessageFriendsUserListItem :image :name>
    <template #append>
      <div flex gap-x-2>
        <v-btn
          v-if="!isFriend && !hasSentFriendRequest"
          size="small"
          text="Send Request"
          variant="tonal"
          @click="sendFriendRequest(id)"
        />
        <v-chip v-else-if="hasSentFriendRequest" size="small" text="Request Sent" />
        <v-chip v-else color="success" size="small" text="Friends" />
        <MessageFriendsBlockUserButton v-if="!isBlocked" :user-id="id" />
      </div>
    </template>
  </MessageFriendsUserListItem>
</template>
