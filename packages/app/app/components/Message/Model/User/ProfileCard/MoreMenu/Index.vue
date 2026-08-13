<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";

interface ProfileCardMoreMenuProps {
  user: Pick<User, "id" | "name">;
}

const { user } = defineProps<ProfileCardMoreMenuProps>();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
</script>

<template>
  <v-avatar color="surface">
    <StyledTooltipMenuIconButton
      :button-props="{ size: 'small' }"
      icon="mdi-dots-horizontal"
      :menu-props="{ location: 'bottom end' }"
      text="More"
    >
      <v-list density="compact" text-body-medium>
        <MessageModelUserProfileCardMoreMenuModerationItems v-if="currentRoomId" :user :room-id="currentRoomId" />
        <MessageModelUserProfileCardMoreMenuCopyUserIdListItem :user-id="user.id" />
      </v-list>
    </StyledTooltipMenuIconButton>
  </v-avatar>
</template>
