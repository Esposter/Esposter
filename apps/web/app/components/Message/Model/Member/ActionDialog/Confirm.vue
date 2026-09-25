<script setup lang="ts">
import type { AdminActionType, User } from "@esposter/db-schema";

import { AdminActionTitleMap } from "@/services/message/moderation/AdminActionTitleMap";

interface Props {
  text: string;
  title: string;
  type: AdminActionType.CreateBan | AdminActionType.KickFromRoom | AdminActionType.SoftBan;
  user: Pick<User, "id">;
}

const isOpen = defineModel<boolean>({ default: false });
const { text, title, type, user } = defineProps<Props>();
const executeAdminAction = useExecuteAdminAction();
</script>

<template>
  <UiConfirmDialog
    v-model="isOpen"
    :confirm-label="AdminActionTitleMap[type]"
    :title
    :confirm="() => executeAdminAction((roomId) => ({ roomId, targetUserId: user.id, type }))"
  >
    <p>{{ text }}</p>
  </UiConfirmDialog>
</template>
