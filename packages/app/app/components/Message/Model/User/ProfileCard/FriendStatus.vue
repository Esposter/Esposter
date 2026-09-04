<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { useFriendStore } from "@/store/message/user/friend";
import { useFriendRequestStore } from "@/store/message/user/friendRequest";

interface Props {
  user: Pick<User, "id">;
}

const { user } = defineProps<Props>();
const friendStore = useFriendStore();
const { checkIsFriend } = friendStore;
const friendRequestStore = useFriendRequestStore();
const { checkHasSentFriendRequest } = friendRequestStore;
const isFriend = computed(() => checkIsFriend(user.id));
</script>

<template>
  <div v-if="isFriend || checkHasSentFriendRequest(user.id)" flex gap-x-2>
    <v-chip v-if="isFriend" density="compact" color="success" prepend-icon="mdi-account-check" text="Friends" />
    <v-chip v-else density="compact" prepend-icon="mdi-clock-outline" text="Request Sent" />
  </div>
</template>
