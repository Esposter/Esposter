<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";

interface Props {
  user: Pick<User, "id" | "name">;
}

const { user } = defineProps<Props>();
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
        <template v-if="currentRoomId">
          <MessageModelUserProfileCardMoreMenuRoleItems :user :room-id="currentRoomId" />
          <MessageModelUserProfileCardMoreMenuModerationItems :user :room-id="currentRoomId" />
        </template>
        <MessageModelUserProfileCardMoreMenuCopyUserIdListItem :user-id="user.id" />
      </v-list>
    </StyledTooltipMenuIconButton>
  </v-avatar>
</template>
