<script setup lang="ts">
import type { PublicUser } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { AdminActionType } from "@esposter/db-schema";

interface Props {
  displayName: string;
  user: Pick<PublicUser, "id">;
}

const isOpen = defineModel<boolean>({ default: false });
const { displayName, user } = defineProps<Props>();
const executeAdminAction = useExecuteAdminAction();
const reason = ref("");
</script>

<template>
  <MessageModelMemberActionDialogShell
    v-model="isOpen"
    :execute="
      () => executeAdminAction((roomId) => ({ reason, roomId, targetUserId: user.id, type: AdminActionType.Warn }))
    "
    submit-label="Warn"
    :submit-variant="UiButtonVariant.Accent"
    :title="`Warn ${displayName}`"
  >
    <UiTextField v-model="reason" is-autofocus label="Reason (optional)" />
    <p text-sm text-muted>Visible in the audit log.</p>
  </MessageModelMemberActionDialogShell>
</template>
