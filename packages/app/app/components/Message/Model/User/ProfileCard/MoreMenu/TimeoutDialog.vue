<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { getResultAsync } from "#shared/error/getResultAsync";
import { withFinalizer } from "#shared/error/withFinalizer";
import { AdminActionListItemPropsMap } from "@/services/message/moderation/AdminActionListItemPropsMap";
import { TimeoutDurationMap } from "@/services/message/moderation/TimeoutDurationMap";
import { useRoomStore } from "@/store/message/room";
import { AdminActionType } from "@esposter/db-schema";

interface TimeoutDialogProps {
  user: Pick<User, "id" | "name">;
}

const { user } = defineProps<TimeoutDialogProps>();
const { $trpc } = useNuxtApp();
const roomStore = useRoomStore();
const { currentRoom } = storeToRefs(roomStore);
const timeoutDurationSelectItems = Object.entries(TimeoutDurationMap).map(([title, value]) => ({ title, value }));
const selectedTimeoutDurationMs = ref(TimeoutDurationMap["1 minute"]);
</script>

<template>
  <StyledFormDialog
    :card-props="{ title: `Timeout ${user.name}` }"
    :confirm-button-props="{ color: 'warning', text: 'Timeout' }"
    @submit="
      async (_event, onComplete) => {
        await withFinalizer(
          getResultAsync(async () => {
            if (!currentRoom) return;
            await $trpc.moderation.executeAdminAction.mutate({
              durationMs: selectedTimeoutDurationMs,
              roomId: currentRoom.id,
              targetUserId: user.id,
              type: AdminActionType.TimeoutUser,
            });
          }),
          () => getResultAsync(onComplete),
        );
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-list-item :="AdminActionListItemPropsMap[AdminActionType.TimeoutUser]" @click.stop="updateIsOpen(true)" />
    </template>
    <div px-4 py-2>
      <v-select v-model="selectedTimeoutDurationMs" :items="timeoutDurationSelectItems" label="Duration" />
    </div>
  </StyledFormDialog>
</template>
