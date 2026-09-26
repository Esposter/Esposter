<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { AdminActionType } from "@esposter/db-schema";

interface Props {
  displayName: string;
  user: Pick<User, "id">;
}

const isOpen = defineModel<boolean>({ default: false });
const { displayName, user } = defineProps<Props>();
const executeAdminAction = useExecuteAdminAction();
const reason = ref("");
const { answer, isPending } = useDialogAnswer(isOpen);
</script>

<template>
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" :title="`Warn ${displayName}`" w="[min(32rem,90vw)]">
    <UiForm
      p-3
      flex
      flex-col
      gap-3
      @submit="
        answer(() =>
          executeAdminAction((roomId) => ({ reason, roomId, targetUserId: user.id, type: AdminActionType.Warn })),
        )
      "
    >
      <UiTextField v-model="reason" is-autofocus label="Reason (optional)" />
      <p text-sm text-muted>Visible in the audit log.</p>
      <footer flex gap-2 justify-end>
        <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
        <UiButton :is-pending type="submit" :variant="UiButtonVariant.Accent"> Warn </UiButton>
      </footer>
    </UiForm>
  </UiDialog>
</template>
