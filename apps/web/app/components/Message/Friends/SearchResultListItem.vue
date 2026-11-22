<script setup lang="ts">
import type { PublicUser } from "@esposter/db-schema";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { useBlockStore } from "#src/store/message/user/block";
import { useFriendStore } from "#src/store/message/user/friend";
import { useFriendRequestStore } from "#src/store/message/user/friendRequest";

interface Props {
  id: PublicUser["id"];
  image: PublicUser["image"];
  name: PublicUser["name"];
}

const { id } = defineProps<Props>();
const blockStore = useBlockStore();
const { blockedUsers } = storeToRefs(blockStore);
const friendRequestStore = useFriendRequestStore();
const { checkHasSentFriendRequest } = friendRequestStore;
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
      <MessageFriendsSendFriendRequestButton v-if="!isFriend && !hasSentFriendRequest" :user-id="id" />
      <UiChip v-else-if="hasSentFriendRequest" :meaning="UiIconMeaning.Awaiting">Request Sent</UiChip>
      <UiChip v-else :meaning="UiIconMeaning.Success">Friends</UiChip>
    </template>
  </MessageFriendsUserListItem>
</template>
