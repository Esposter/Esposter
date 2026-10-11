<script setup lang="ts">
import type { PublicUser } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { TimeoutDurationMap } from "@/services/message/moderation/TimeoutDurationMap";
import { TimeoutDurationSelectItems } from "@/services/message/moderation/TimeoutDurationSelectItems";
import { AdminActionType } from "@esposter/db-schema";

interface Props {
  displayName: string;
  user: Pick<PublicUser, "id">;
}

const isOpen = defineModel<boolean>({ default: false });
const { displayName, user } = defineProps<Props>();
const executeAdminAction = useExecuteAdminAction();
// A radio group's values are strings, so each duration is carried as its milliseconds written out
const durationItems = TimeoutDurationSelectItems.map(({ title, value }) => ({ title, value: String(value) }));
const selectedDurationMs = ref(String(TimeoutDurationMap["1 minute"]));
</script>

<template>
  <MessageModelMemberActionDialogShell
    v-model="isOpen"
    :execute="
      () =>
        executeAdminAction((roomId) => ({
          durationMs: Number(selectedDurationMs),
          roomId,
          targetUserId: user.id,
          type: AdminActionType.TimeoutUser,
        }))
    "
    submit-label="Timeout"
    :submit-variant="UiButtonVariant.Danger"
    :title="`Timeout ${displayName}`"
  >
    <UiRadioGroup v-model="selectedDurationMs" :items="durationItems" label="Duration" />
  </MessageModelMemberActionDialogShell>
</template>
