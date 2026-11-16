<script setup lang="ts">
import type { MemberActionDialogProps } from "#src/models/message/member/MemberActionDialogProps";

import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "#src/models/ui/UiDialogPlacement";
import { UiDialogSize } from "#src/models/ui/UiDialogSize";
import { getResolvedDisplayName } from "#src/services/message/member/getResolvedDisplayName";
import { useUserStore } from "#src/store/message/user/index";
import { useMemberStore } from "#src/store/message/user/member";
import { ID_SEPARATOR, noop } from "@esposter/shared";

const isOpen = defineModel<boolean>({ default: false });
const { displayName, roomId, user } = defineProps<MemberActionDialogProps>();
const { $trpc } = useNuxtApp();
const memberStore = useMemberStore();
const { storeUpdateMembers } = memberStore;
const userStore = useUserStore();
const { getRoomMemberMap } = userStore;
const { executeMutation } = useMutation();
const { answer, isPending } = useDialogAnswer(isOpen);
// The field starts on the name the row shows, so saving it as it stands writes nothing
const editedDisplayName = ref(displayName);
// The field saves on blur and on Enter, and Save submits. Blur is often only passing focus through, so a save of the
// Name as it stands writes nothing and leaves the dialog open
const save = () => {
  const newDisplayName = editedDisplayName.value;
  if (newDisplayName === displayName) return;

  answer(() => {
    executeMutation(
      () => $trpc.userToRoom.updateUserToRoom.mutate({ displayName: newDisplayName, roomId, targetUserId: user.id }),
      {
        // The row shows the name the server resolves: the typed one trimmed, or the account's own name for a blank one.
        // It is drawn at once, so the list needs no read back after the write. A refusal puts back only the display name,
        // And only while the row still shows this write's
        applyOptimistic: () => {
          const member = getRoomMemberMap(roomId)?.get(user.id);
          if (!member) return noop;

          const previousDisplayName = member.displayName;
          const resolvedDisplayName = getResolvedDisplayName(newDisplayName, member.name);
          storeUpdateMembers(roomId, [{ ...member, displayName: resolvedDisplayName }]);
          return () => {
            const currentMember = getRoomMemberMap(roomId)?.get(user.id);
            if (currentMember?.displayName === resolvedDisplayName)
              storeUpdateMembers(roomId, [{ ...currentMember, displayName: previousDisplayName }]);
          };
        },
        key: `${roomId}${ID_SEPARATOR}${user.id}`,
      },
    );
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
