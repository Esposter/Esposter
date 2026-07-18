<script setup lang="ts">
import type { User } from "@esposter/db-schema";

import { createModerationNoteInputSchema } from "#shared/models/db/moderation/CreateModerationNoteInput";
import { dayjs } from "#shared/services/dayjs";
import { useAlertStore } from "@/store/alert";
import { useModerationNoteStore } from "@/store/message/moderation/note";
import { useMemberStore } from "@/store/message/user/member";
import { MODERATION_NOTE_MAX_LENGTH } from "@esposter/db-schema";

interface NotesDialogProps {
  roomId: string;
  user: Pick<User, "id" | "name">;
}

const { roomId, user } = defineProps<NotesDialogProps>();
const { $trpc } = useNuxtApp();
const rules = useVRules();
const { createAlert } = useAlertStore();
const { readModerationNotes, readMoreModerationNotes } = useReadModerationNotes(roomId, () => user.id);
const moderationNoteStore = useModerationNoteStore();
const { hasMore, items } = storeToRefs(moderationNoteStore);
const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
const memberNameById = computed(() => new Map(members.value.map(({ id, name }) => [id, name])));
const getActorName = (actorUserId: string) => memberNameById.value.get(actorUserId) ?? actorUserId;
const note = ref("");
const isNoteValid = computed(() => createModerationNoteInputSchema.shape.note.safeParse(note.value).success);
// Load on setup (no Suspense boundary) so the count badge reflects existing notes before the dialog opens.
useQuery(readModerationNotes);
const executeMutation = useMutation();
// Adding a note keeps the dialog open (onComplete(false)) so a moderator can keep reviewing while writing.
const createNote = (onComplete: (isSuccessful?: boolean) => void) =>
  executeMutation(
    () => $trpc.message.moderation.createModerationNote.mutate({ note: note.value, roomId, targetUserId: user.id }),
    {
      onError: (error) => {
        createAlert(error.message, "error");
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
    :card-props="{ prependIcon: 'mdi-note-text-outline', title: `Notes for ${user.name}` }"
    :confirm-button-props="{ disabled: !isNoteValid, text: 'Add note' }"
    @submit="(_event, onComplete) => createNote(onComplete)"
  >
    <template #activator="{ updateIsOpen }">
      <v-list-item prepend-icon="mdi-note-text-outline" title="Notes" @click.stop="updateIsOpen(true)">
        <template #append>
          <v-badge v-if="items.length > 0" :content="items.length" color="primary" inline />
        </template>
      </v-list-item>
    </template>
    <div flex flex-col gap-2>
      <div v-if="items.length === 0" op-medium-emphasis>No notes yet.</div>
      <v-list v-else lines="two" max-height="240" style="overflow-y: auto">
        <v-list-item v-for="{ actorUserId, createdAt, note: itemNote, rowKey } of items" :key="rowKey">
          <div whitespace-pre-wrap break-words>{{ itemNote }}</div>
          <v-list-item-subtitle
            >{{ getActorName(actorUserId) }} · {{ dayjs(createdAt).fromNow() }}</v-list-item-subtitle
          >
        </v-list-item>
        <StyledWaypoint :is-active="hasMore" @change="readMoreModerationNotes" />
      </v-list>
      <v-textarea
        v-model="note"
        :rules="[rules.maxLength(MODERATION_NOTE_MAX_LENGTH)]"
        auto-grow
        label="Add a note"
        rows="2"
      />
    </div>
  </StyledFormDialog>
</template>
