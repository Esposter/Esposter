<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { AdminActionListItemPropsMap } from "@/services/message/moderation/AdminActionListItemPropsMap";
import { TimeoutDurationMap } from "@/services/message/moderation/TimeoutDurationMap";
import { TimeoutDurationSelectItems } from "@/services/message/moderation/TimeoutDurationSelectItems";
import { AdminActionType } from "@esposter/db-schema";

interface Props {
  displayName: string;
  user: Pick<User, "id">;
}

const { displayName, user } = defineProps<Props>();
const executeAdminAction = useExecuteAdminAction();
const selectedTimeoutDurationMs = ref<number>(TimeoutDurationMap["1 minute"]);
</script>

<template>
  <StyledFormDialog
    :card-props="{ title: `Timeout ${displayName}` }"
    :confirm-button-props="{ color: 'warning', text: 'Timeout' }"
    @submit="
      (_event, onComplete) =>
        executeAdminAction(
          (roomId) => ({
            durationMs: selectedTimeoutDurationMs,
            roomId,
            targetUserId: user.id,
            type: AdminActionType.TimeoutUser,
          }),
          onComplete,
        )
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-list-item :="AdminActionListItemPropsMap[AdminActionType.TimeoutUser]" @click.stop="updateIsOpen(true)" />
    </template>
    <v-select v-model="selectedTimeoutDurationMs" :items="TimeoutDurationSelectItems" label="Duration" />
  </StyledFormDialog>
</template>
