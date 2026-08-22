<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useDialogStore } from "@/store/message/room/dialog";
import { useRoleStore } from "@/store/message/room/role";
import { DatabaseEntityType } from "@esposter/db-schema";

interface ListItemSettingsButtonProps {
  isActive: boolean;
  isHovering: boolean;
  room: RoomInMessage;
}

const { isActive, isHovering, room } = defineProps<ListItemSettingsButtonProps>();
const { data: session } = await authClient.useSession(useFetch);
const roleStore = useRoleStore();
const { checkIsManageable } = roleStore;
const dialogStore = useDialogStore();
const { settingsRoomId } = storeToRefs(dialogStore);
const isVisible = computed(() => room.userId === session.value?.user.id || checkIsManageable(room.id));
</script>

<template>
  <StyledLinkRowActions>
    <v-tooltip :text="`${DatabaseEntityType.Room} Settings`">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          v-show="(isActive || isHovering) && isVisible"
          :="tooltipProps"
          :ripple="false"
          density="compact"
          icon="mdi-cog"
          variant="plain"
          size="small"
          @click="settingsRoomId = room.id"
        />
      </template>
    </v-tooltip>
  </StyledLinkRowActions>
</template>
