<script setup lang="ts">
import type { MemberActionTarget } from "#src/models/message/member/MemberActionTarget";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { TimeoutDurationMap } from "#src/services/message/moderation/TimeoutDurationMap";
import { TimeoutDurationSelectItems } from "#src/services/message/moderation/TimeoutDurationSelectItems";
import { AdminActionType } from "@esposter/db-schema";

interface Props extends MemberActionTarget {}

const isOpen = defineModel<boolean>({ default: false });
defineProps<Props>();
// A radio group's values are strings, so each duration is carried as its milliseconds written out
const durationItems = TimeoutDurationSelectItems.map(({ title, value }) => ({ title, value: String(value) }));
const selectedDurationMs = ref(String(TimeoutDurationMap["1 minute"]));
</script>

<template>
  <MessageModelMemberActionDialogShell
    v-model="isOpen"
    :get-input="
      (roomId) => ({
        durationMs: Number(selectedDurationMs),
        roomId,
        targetUserId: user.id,
        type: AdminActionType.TimeoutUser,
      })
    "
    submit-label="Timeout"
    :submit-variant="UiButtonVariant.Danger"
    :title="`Timeout ${displayName}`"
  >
    <UiRadioGroup v-model="selectedDurationMs" :items="durationItems" label="Duration" />
  </MessageModelMemberActionDialogShell>
</template>
