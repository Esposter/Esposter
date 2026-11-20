<script setup lang="ts">
import type { MemberActionDialogProps } from "#src/models/message/member/MemberActionDialogProps";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "#src/models/ui/UiDialogPlacement";
import { UiDialogSize } from "#src/models/ui/UiDialogSize";
import { useMemberStore } from "#src/store/message/user/member";

const isOpen = defineModel<boolean>({ default: false });
const { displayName, roomId, user } = defineProps<MemberActionDialogProps>();
const memberStore = useMemberStore();
const { renameMember } = memberStore;
const { answer, isPending } = useDialogAnswer(isOpen);
// The field starts on the name the row shows, so saving it as it stands writes nothing
const editedDisplayName = ref(displayName);
// The field saves on blur and on Enter, and Save submits. Blur is often only passing focus through, so a save of the
// Name as it stands writes nothing and leaves the dialog open
const save = () => {
  const newDisplayName = editedDisplayName.value;
  if (newDisplayName === displayName) return;

  answer(() => {
    renameMember(roomId, user.id, newDisplayName);
  });
};
</script>

<template>
  <UiDialog
    v-model="isOpen"
    :placement="UiDialogPlacement.Middle"
    :title="`Display name for ${displayName}`"
    :size="UiDialogSize.Medium"
  >
    <template #default="{ formId }">
      <UiForm :id="formId" flex flex-col gap-3 @submit="save()">
        <MessageModelRoomSettingsTypeProfileDisplayNameField v-model="editedDisplayName" @save="save()" />
      </UiForm>
    </template>
    <template #footer="{ formId }">
      <UiButton is-autofocus :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
      <UiButton :is-pending :form="formId" type="submit" :variant="UiButtonVariant.Accent">Save</UiButton>
    </template>
  </UiDialog>
</template>
