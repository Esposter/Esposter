<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { createModerationNoteInputSchema } from "#shared/models/db/moderation/CreateModerationNoteInput";
import { createErrorAlert } from "@/services/trpc/createErrorAlert";
import { useModerationNoteStore } from "@/store/message/moderation/note";
import { MODERATION_NOTE_MAX_LENGTH } from "@esposter/db-schema";

interface Props {
  displayName: string;
  roomId: string;
  user: Pick<User, "id">;
}

const { displayName, roomId, user } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const rules = useVRules();
const noteRules = computed(() => [rules.maxLength(MODERATION_NOTE_MAX_LENGTH)]);
const { readModerationNotes, readMoreModerationNotes } = useReadModerationNotes(roomId, () => user.id);
const moderationNoteStore = useModerationNoteStore();
const { currentTargetUserId, hasMore, items } = storeToRefs(moderationNoteStore);
const { getModerationNoteCount } = moderationNoteStore;
const moderationNoteCount = computed(() => getModerationNoteCount(user.id));
const note = ref("");
const isNoteValid = computed(() => createModerationNoteInputSchema.shape.note.safeParse(note.value).success);
// Points the store's paginated slice at this target before loading. Only one of these is ever mounted —
// A closed v-menu unmounts its content — so whichever dialog is open owns the ref. It is deliberately not
// Cleared on unmount: hovering one member then another mounts the new dialog before the old one tears down,
// So a teardown that blanked the ref would blank the list the new dialog has already claimed
currentTargetUserId.value = user.id;
// Load on setup (no Suspense boundary) so the count badge reflects existing notes before the dialog opens.
useQuery(readModerationNotes);
const { executeMutation } = useMutation();
// Adding a note keeps the dialog open (onComplete(false)) so a moderator can keep reviewing while writing.
const createNote = (onComplete: (isSuccessful?: boolean) => void) =>
  executeMutation(
    () => $trpc.message.moderation.createModerationNote.mutate({ note: note.value, roomId, targetUserId: user.id }),
    {
      key: Symbol("createModerationNote"),
      onError: (error) => {
        createErrorAlert(error);
        onComplete(false);
      },
      onSuccess: async () => {
        note.value = "";
        await readModerationNotes();
        onComplete(false);
      },
    },
  );
</script>

<template>
  <StyledFormDialog
    :card-props="{ prependIcon: 'mdi-note-text-outline', title: `Notes for ${displayName}` }"
    :confirm-button-props="{ disabled: !isNoteValid, text: 'Add note' }"
    @submit="(_event, onComplete) => createNote(onComplete)"
  >
    <template #activator="{ updateIsOpen }">
      <v-list-item prepend-icon="mdi-note-text-outline" title="Notes" @click.stop="updateIsOpen(true)">
        <template #append>
          <v-badge v-if="moderationNoteCount > 0" :content="moderationNoteCount" color="primary" inline />
        </template>
      </v-list-item>
    </template>
    <div flex flex-col gap-2>
      <div v-if="items.length === 0" op-medium-emphasis>No notes yet.</div>
      <v-list v-else lines="two" max-height="15rem" overflow-y-auto>
        <MessageModelUserProfileCardMoreMenuNoteListItem v-for="item of items" :key="item.rowKey" :note="item" />
        <StyledWaypoint :is-active="hasMore" @change="readMoreModerationNotes" />
      </v-list>
      <v-textarea v-model="note" :rules="noteRules" auto-grow label="Add a note" rows="2" />
    </div>
  </StyledFormDialog>
</template>
