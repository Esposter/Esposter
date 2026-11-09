<script setup lang="ts">
import type { MemberActionDialogProps } from "@/models/message/member/MemberActionDialogProps";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiDialogSize } from "@/models/ui/UiDialogSize";
import { useMemberStore } from "@/store/message/user/member";

const isOpen = defineModel<boolean>({ default: false });
const { displayName, roomId, user } = defineProps<MemberActionDialogProps>();
const { $trpc } = useNuxtApp();
const memberStore = useMemberStore();
const { storeUpdateMembers } = memberStore;
const { answer, isPending } = useDialogAnswer(isOpen);
// The save sits in the footer, beside the form it submits, so it names the form by id
const formId = useId();
// The field starts on the name the row shows, so saving it as it stands writes nothing
const editedDisplayName = ref(displayName);
// The field saves on blur and on Enter, and Save submits. A save that changes nothing returns false, so the dialog
// Stays open rather than closing on a blur that was only passing focus through, and a save while one is in flight is
// Dropped by `answer`, which is exclusive
const save = () =>
  answer(async () => {
    if (editedDisplayName.value === displayName) return false;

    await $trpc.userToRoom.updateUserToRoom.mutate({
      displayName: editedDisplayName.value,
      roomId,
      targetUserId: user.id,
    });
    // No subscription reaches the member who wrote this, so the row is read back for the name the server resolved
    storeUpdateMembers(roomId, await $trpc.room.readUsersByIds.query({ roomId, userIds: [user.id] }));
  });
</script>

<template>
  <UiDialog
    v-model="isOpen"
    :placement="UiDialogPlacement.Middle"
    :title="`Display name for ${displayName}`"
    :size="UiDialogSize.Medium"
  >
    <UiForm :id="formId" flex flex-col gap-3 @submit="save()">
      <MessageModelRoomSettingsTypeProfileDisplayNameField v-model="editedDisplayName" @save="save()" />
    </UiForm>
    <template #footer>
      <UiButton :variant="UiButtonVariant.Quiet" autofocus @click="isOpen = false">Cancel</UiButton>
      <UiButton :is-pending :form="formId" type="submit" :variant="UiButtonVariant.Accent">Save</UiButton>
    </template>
  </UiDialog>
</template>
