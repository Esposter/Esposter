<script setup lang="ts">
import type { MemberActionTarget } from "@/models/message/member/MemberActionTarget";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { AdminActionType } from "@esposter/db-schema";

interface Props extends MemberActionTarget {}

const isOpen = defineModel<boolean>({ default: false });
const { displayName, user } = defineProps<Props>();
const reason = ref("");
</script>

<template>
  <MessageModelMemberActionDialogShell
    v-model="isOpen"
    :get-input="(roomId) => ({ reason, roomId, targetUserId: user.id, type: AdminActionType.Warn })"
    submit-label="Warn"
    :submit-variant="UiButtonVariant.Accent"
    :title="`Warn ${displayName}`"
  >
    <UiTextField v-model="reason" is-autofocus label="Reason (optional)" />
    <p text-sm text-muted>Visible in the audit log.</p>
  </MessageModelMemberActionDialogShell>
</template>
