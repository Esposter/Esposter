<script setup lang="ts">
import type { MemberActionDialogProps } from "#src/models/message/member/MemberActionDialogProps";

import { createModerationNoteInputSchema } from "#shared/models/db/moderation/CreateModerationNoteInput";
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "#src/models/ui/UiDialogPlacement";
import { UiDialogSize } from "#src/models/ui/UiDialogSize";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { applyIfUnchanged } from "#src/services/shared/applyIfUnchanged";
import { UiRules } from "#src/services/ui/UiRules";
import { useModerationNoteStore } from "#src/store/message/moderation/note";
import { MODERATION_NOTE_MAX_LENGTH } from "@esposter/db-schema";

const isOpen = defineModel<boolean>({ default: false });
const { roomId, user } = defineProps<MemberActionDialogProps>();
const noteRules = [UiRules.maxLength(MODERATION_NOTE_MAX_LENGTH)];
const { readModerationNotes, readMoreModerationNotes } = useReadModerationNotes(roomId, () => user.id);
const { createModerationNote, isCreatePending } = useCreateModerationNote(roomId, () => user.id);
const moderationNoteStore = useModerationNoteStore();
const { currentTargetUserId, hasMore, items } = storeToRefs(moderationNoteStore);
const note = ref("");
const isNoteValid = computed(() => createModerationNoteInputSchema.shape.note.safeParse(note.value).success);
// Points the store's paginated slice at this target before loading. Only one of these is ever mounted: the list mounts
// It Only while one is open, and the row that opened it sets its target, so whichever dialog is open owns the ref. It
// Is Deliberately not cleared on unmount: a dialog for another member can mount before this one tears down, and a
// Teardown That blanked the ref would blank the list the new dialog has already claimed
currentTargetUserId.value = user.id;
const { error, isPending, refresh } = useQuery(readModerationNotes);
// The field keeps the note until the server has it, so a refused note stays in place to be sent again. A note the
// Reader has Typed since is left alone when the sent one is kept
const sendNote = async () => {
  const sentNote = note.value;
  if (await createModerationNote(sentNote)) applyIfUnchanged(note, sentNote, "");
};
</script>

<template>
  <UiDialog
    v-model="isOpen"
    :placement="UiDialogPlacement.Middle"
    :title="`Notes for ${displayName}`"
    :size="UiDialogSize.Medium"
  >
    <template #default="{ formId }">
      <ul v-if="isPending && items.length === 0" aria-busy="true" flex flex-col gap-3>
        <li v-for="index of 3" :key="index" flex flex-col gap-1>
          <UiSkeleton h-4 w="2/3" />
          <UiSkeleton h-4 w="1/3" />
        </li>
      </ul>
      <div v-else-if="items.length > 0">
        <ul flex flex-col gap-3>
          <MessageModelMemberActionDialogNoteListItem v-for="item of items" :key="item.id" :note="item" />
        </ul>
        <StyledWaypoint :is-active="hasMore" @change="(onComplete) => readMoreModerationNotes(onComplete)" />
      </div>
      <UiErrorState v-else-if="error" :error @retry="refresh()" />
      <UiEmptyState
        v-else
        description="Add one below to keep track of this member."
        :meaning="UiIconMeaning.Comment"
        title="No notes yet"
      />
      <!-- Adding a note keeps the dialog open, so a moderator can keep reviewing while writing -->
      <UiForm :id="formId" flex flex-col gap-3 @submit="sendNote()">
        <UiTextField
          v-model="note"
          :counter="MODERATION_NOTE_MAX_LENGTH"
          label="Add a note"
          :rows="2"
          :rules="noteRules"
        />
      </UiForm>
    </template>
    <template #footer="{ formId }">
      <UiButton
        :disabled="!isNoteValid"
        :form="formId"
        :is-pending="isCreatePending"
        type="submit"
        :variant="UiButtonVariant.Accent"
      >
        Add note
      </UiButton>
    </template>
  </UiDialog>
</template>
