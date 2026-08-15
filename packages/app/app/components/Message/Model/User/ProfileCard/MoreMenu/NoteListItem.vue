<script setup lang="ts">
import type { ModerationNoteEntity } from "@esposter/db-schema";

import { dayjs } from "#shared/services/dayjs";
import { useMemberStore } from "@/store/message/user/member";

interface NoteListItemProps {
  note: ModerationNoteEntity;
}

const { note } = defineProps<NoteListItemProps>();
const memberStore = useMemberStore();
const { getMemberName } = memberStore;
const actorName = computed(() => getMemberName(note.actorUserId));
const displayCreatedAt = computed(() => dayjs(note.createdAt).fromNow());
</script>

<template>
  <v-list-item>
    <div whitespace-pre-wrap break-words>{{ note.note }}</div>
    <v-list-item-subtitle>{{ actorName }} · {{ displayCreatedAt }}</v-list-item-subtitle>
  </v-list-item>
</template>
