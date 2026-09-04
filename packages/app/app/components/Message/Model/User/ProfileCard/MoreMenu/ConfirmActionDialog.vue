<script setup lang="ts">
import type { AdminActionType, User } from "@esposter/db-schema";

import { AdminActionListItemPropsMap } from "@/services/message/moderation/AdminActionListItemPropsMap";
import { AdminActionTitleMap } from "@/services/message/moderation/AdminActionTitleMap";

interface Props {
  text: string;
  title: string;
  type: AdminActionType.CreateBan | AdminActionType.KickFromRoom | AdminActionType.SoftBan;
  user: Pick<User, "id">;
}

const { text, title, type, user } = defineProps<Props>();
const executeAdminAction = useExecuteAdminAction();
</script>

<template>
  <StyledDeleteFormDialog
    :card-props="{ title }"
    :confirm-button-props="{ text: AdminActionTitleMap[type] }"
    @delete="(onComplete) => executeAdminAction((roomId) => ({ roomId, targetUserId: user.id, type }), onComplete)"
  >
    <template #activator="{ updateIsOpen }">
      <v-list-item :="AdminActionListItemPropsMap[type]" @click.stop="updateIsOpen(true)" />
    </template>
    {{ text }}
  </StyledDeleteFormDialog>
</template>
