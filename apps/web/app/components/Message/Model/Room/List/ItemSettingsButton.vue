<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useRoomDialogStore } from "@/store/message/room/dialog";
import { useRoleStore } from "@/store/message/room/role";
import { DatabaseEntityType } from "@esposter/db-schema";

interface Props {
  isActive: boolean;
  isHovering: boolean;
  room: RoomInMessage;
}

const { isActive, isHovering, room } = defineProps<Props>();
const { data: session } = await authClient.useSession(useFetch);
const roleStore = useRoleStore();
const { checkIsManageable } = roleStore;
const roomDialogStore = useRoomDialogStore();
const { settingsRoomId } = storeToRefs(roomDialogStore);
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
