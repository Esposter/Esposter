<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { createModerationNoteInputSchema } from "#shared/models/db/moderation/CreateModerationNoteInput";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useModerationNoteStore } from "@/store/message/moderation/note";
import { MODERATION_NOTE_MAX_LENGTH } from "@esposter/db-schema";

interface Props {
  displayName: string;
  roomId: string;
  user: Pick<User, "id">;
}

const isOpen = defineModel<boolean>({ default: false });
const { displayName, roomId, user } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const rules = useVRules();
const noteRules = computed(() => [rules.maxLength(MODERATION_NOTE_MAX_LENGTH)]);
const { readModerationNotes, readMoreModerationNotes } = useReadModerationNotes(roomId, () => user.id);
const moderationNoteStore = useModerationNoteStore();
const { currentTargetUserId, hasMore, items } = storeToRefs(moderationNoteStore);
const note = ref("");
const isNoteValid = computed(() => createModerationNoteInputSchema.shape.note.safeParse(note.value).success);
// Points the store's paginated slice at this target before loading. Only one of these is ever mounted — the row that
// Opened it mounts it only while it is open — so whichever dialog is open owns the ref. It is deliberately not
// Cleared on unmount: a dialog for another member can mount before this one tears down, and a teardown that blanked
// The ref would blank the list the new dialog has already claimed
currentTargetUserId.value = user.id;
const { isPending } = useQuery(readModerationNotes);
const { executeMutation, isPending: isCreatePending } = useMutation();
</script>

<template>
  <UiDialog
    v-model="isOpen"
    :placement="UiDialogPlacement.Middle"
    :title="`Notes for ${displayName}`"
    w="[min(36rem,90vw)]"
  >
    <div p-3 flex flex-col gap-3 min-h-0>
      <ul v-if="isPending && items.length === 0" aria-busy="true" flex flex-col gap-3>
        <li v-for="index of 3" :key="index" flex flex-col gap-1>
          <UiSkeleton h-4 w="2/3" />
          <UiSkeleton h-4 w="1/3" />
        </li>
      </ul>
      <div v-else-if="items.length > 0" max-h="[40dvh]" of-y-auto>
        <ul flex flex-col gap-3>
          <MessageModelMemberActionDialogNoteListItem v-for="item of items" :key="item.rowKey" :note="item" />
        </ul>
        <StyledWaypoint :is-active="hasMore" @change="(onComplete) => readMoreModerationNotes(onComplete)" />
      </div>
      <UiEmptyState
        v-else
        description="Add one below to keep track of this member."
        :meaning="UiIconMeaning.Comment"
        title="No notes yet"
      />
      <!-- Adding a note keeps the dialog open, so a moderator can keep reviewing while writing -->
      <UiForm
        flex
        flex-col
        gap-3
        @submit="
          executeMutation(
            () => $trpc.message.moderation.createModerationNote.mutate({ note, roomId, targetUserId: user.id }),
            {
              key: Symbol('createModerationNote'),
              onError: (error) => {
                createErrorAlert(error);
              },
              onSuccess: async () => {
                note = '';
                await readModerationNotes();
              },
            },
          )
        "
      >
        <UiTextField
          v-model="note"
          :counter="MODERATION_NOTE_MAX_LENGTH"
          label="Add a note"
          :rows="2"
          :rules="noteRules"
        />
        <footer flex gap-2 justify-end>
          <UiButton :disabled="!isNoteValid || isCreatePending" type="submit" :variant="UiButtonVariant.Accent">
            <UiSpinner v-if="isCreatePending" />
            Add note
          </UiButton>
        </footer>
      </UiForm>
    </div>
  </UiDialog>
</template>
