<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

interface ProfileCardFriendStatusProps {
  user: Pick<User, "id">;
}

const { user } = defineProps<ProfileCardFriendStatusProps>();
const friendStore = useFriendStore();
const { getIsFriend } = friendStore;
const friendRequestStore = useFriendRequestStore();
const { getHasSentFriendRequest } = friendRequestStore;
const isFriend = computed(() => getIsFriend(user.id));
</script>

<template>
  <div v-if="isFriend || getHasSentFriendRequest(user.id)" flex gap-x-2>
    <v-chip v-if="isFriend" density="compact" color="success" prepend-icon="mdi-account-check" text="Friends" />
    <v-chip v-else density="compact" prepend-icon="mdi-clock-outline" text="Request Sent" />
  </div>
</template>
