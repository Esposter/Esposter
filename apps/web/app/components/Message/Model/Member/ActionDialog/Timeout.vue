<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { TimeoutDurationMap } from "@/services/message/moderation/TimeoutDurationMap";
import { TimeoutDurationSelectItems } from "@/services/message/moderation/TimeoutDurationSelectItems";
import { AdminActionType } from "@esposter/db-schema";

interface Props {
  displayName: string;
  user: Pick<User, "id">;
}

const isOpen = defineModel<boolean>({ default: false });
const { displayName, user } = defineProps<Props>();
const executeAdminAction = useExecuteAdminAction();
// A radio group's values are strings, so each duration is carried as its milliseconds written out
const durationItems = TimeoutDurationSelectItems.map(({ title, value }) => ({ title, value: String(value) }));
const selectedDurationMs = ref(String(TimeoutDurationMap["1 minute"]));
const { answer, isPending } = useDialogAnswer(isOpen);
</script>

<template>
  <UiDialog
    v-model="isOpen"
    :placement="UiDialogPlacement.Middle"
    :title="`Timeout ${displayName}`"
    w="[min(32rem,90vw)]"
  >
    <div p-3 flex flex-col gap-3 min-h-0 of-y-auto>
      <UiRadioGroup v-model="selectedDurationMs" :items="durationItems" label="Duration" />
    </div>
    <footer p-3 flex gap-2 justify-end>
      <UiButton :variant="UiButtonVariant.Quiet" autofocus @click="isOpen = false">Cancel</UiButton>
      <UiButton
        :is-pending="isPending"
        :variant="UiButtonVariant.Danger"
        @click="
          answer(() =>
            executeAdminAction((roomId) => ({
              durationMs: Number(selectedDurationMs),
              roomId,
              targetUserId: user.id,
              type: AdminActionType.TimeoutUser,
            })),
          )
        "
      >
        Timeout
      </UiButton>
    </footer>
  </UiDialog>
</template>
