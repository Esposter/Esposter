<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { AdminActionListItemPropsMap } from "@/services/message/moderation/AdminActionListItemPropsMap";
import { AdminActionType } from "@esposter/db-schema";

interface Props {
  displayName: string;
  user: Pick<User, "id">;
}

const { displayName, user } = defineProps<Props>();
const executeAdminAction = useExecuteAdminAction();
const reason = ref("");
</script>

<template>
  <StyledFormDialog
    :card-props="{ title: `Warn ${displayName}` }"
    :confirm-button-props="{ color: 'warning', text: 'Warn' }"
    @submit="
      (_event, onComplete) =>
        executeAdminAction(
          (roomId) => ({ reason, roomId, targetUserId: user.id, type: AdminActionType.Warn }),
          onComplete,
        )
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-list-item :="AdminActionListItemPropsMap[AdminActionType.Warn]" @click.stop="updateIsOpen(true)" />
    </template>
    <v-text-field v-model="reason" hint="Visible in the audit log" label="Reason (optional)" persistent-hint />
  </StyledFormDialog>
</template>
