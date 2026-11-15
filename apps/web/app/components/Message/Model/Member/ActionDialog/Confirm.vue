<script setup lang="ts">
import type { MemberActionTarget } from "#src/models/message/member/MemberActionTarget";
import type { AdminActionType } from "@esposter/db-schema";

import { AdminActionTitleMap } from "#src/services/message/moderation/AdminActionTitleMap";

interface Props {
  text: string;
  title: string;
  type:
    | typeof AdminActionType.CreateBan
    | typeof AdminActionType.KickFromRoom
    | typeof AdminActionType.SoftBan
    | typeof AdminActionType.Warn;
  user: MemberActionTarget["user"];
}

const isOpen = defineModel<boolean>({ default: false });
defineProps<Props>();
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
