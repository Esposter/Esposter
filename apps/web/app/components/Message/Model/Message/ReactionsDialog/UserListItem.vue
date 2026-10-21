<script setup lang="ts">
import type { PublicUser, RoomInMessage } from "@esposter/db-schema";

import { useUserStore } from "@/store/message/user";

interface Props {
  roomId: RoomInMessage["id"];
  userId: PublicUser["id"];
}

const { roomId, userId } = defineProps<Props>();
const userStore = useUserStore();
const { getRoomMemberMap } = userStore;
const { userMap } = storeToRefs(userStore);
const user = computed(() => userMap.value.get(userId));
// The room display name — a displayName where one is set, which is what the rest of the room shows this person as.
// A reactor with no membership in the room is named by the account
const memberName = computed(() => getRoomMemberMap(roomId)?.get(userId)?.displayName ?? user.value?.name ?? "");
</script>

<template>
  <!-- The account's own name follows only when a displayName is standing in front of it, which is Discord's rule too -->
  <div role="listitem" ui-row>
    <UiItemContent
      :description="user && user.name !== memberName ? user.name : undefined"
      :image="user?.image ?? ''"
      :title="memberName"
    />
  </div>
</template>
