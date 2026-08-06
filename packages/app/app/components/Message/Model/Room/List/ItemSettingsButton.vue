<script setup lang="ts">
import type { RoomInMessage } from "@esposter/db-schema";

import { authClient } from "@/services/auth/authClient";
import { useDialogStore } from "@/store/message/room/dialog";
import { useRoleStore } from "@/store/message/room/role";
import { DatabaseEntityType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";

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
const isCreator = computed(() => room.userId === session.value?.user.id);
const isVisible = computed(() => isCreator.value || checkIsManageable(room.id));
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
          @click="
            async () => {
              // Settings panels (Roles, Members) load and key their data by the current room,
              // so opening settings for another room navigates there first
              if (!isActive) await navigateTo(RoutePath.Messages(room.id));
              settingsRoomId = room.id;
            }
          "
        />
      </template>
    </v-tooltip>
  </StyledLinkRowActions>
</template>
