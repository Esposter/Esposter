<script setup lang="ts">
import type { PublicUser, RoomInMessage } from "@esposter/db-schema";

import { useUserStore } from "@/store/message/user";

interface Props {
  roomId: RoomInMessage["id"];
  userId: PublicUser["id"];
}

const { roomId, userId } = defineProps<Props>();
const userStore = useUserStore();
const { getRoomMemberName } = userStore;
const { userMap } = storeToRefs(userStore);
const user = computed(() => userMap.value.get(userId));
// The room display name, which is what the rest of the room shows this person as
const memberName = computed(() => getRoomMemberName(roomId, userId));
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
