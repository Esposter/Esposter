<script setup lang="ts">
import type { MemberActionTarget } from "@/models/message/member/MemberActionTarget";
import type { AdminActionType } from "@esposter/db-schema";

import { AdminActionTitleMap } from "@/services/message/moderation/AdminActionTitleMap";

interface Props {
  text: string;
  title: string;
  type: AdminActionType.CreateBan | AdminActionType.KickFromRoom | AdminActionType.SoftBan;
  user: MemberActionTarget["user"];
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
