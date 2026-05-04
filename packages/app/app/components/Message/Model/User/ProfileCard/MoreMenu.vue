<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { useRoomStore } from "@/store/message/room";
import { mergeProps } from "vue";

interface ProfileCardMoreMenuProps {
  user: Pick<User, "id" | "name">;
}

const { user } = defineProps<ProfileCardMoreMenuProps>();
const roomStore = useRoomStore();
const { currentRoomId } = storeToRefs(roomStore);
</script>

<template>
  <v-menu location="bottom end">
    <template #activator="{ props: menuProps }">
      <v-tooltip text="More">
        <template #activator="{ props: tooltipProps }">
          <v-avatar color="surface">
            <v-btn icon="mdi-dots-horizontal" size="small" :="mergeProps(menuProps, tooltipProps)" />
          </v-avatar>
        </template>
      </v-tooltip>
    </template>
    <v-list density="compact" text-sm>
      <MessageModelUserProfileCardMoreMenuModerationItems v-if="currentRoomId" :user :room-id="currentRoomId" />
      <MessageModelUserProfileCardMoreMenuCopyUserIdListItem :user-id="user.id" />
    </v-list>
  </v-menu>
</template>
