<script setup lang="ts">
import type { ModerationNoteEntity } from "@esposter/db-schema";

import { useMemberStore } from "@/store/message/user/member";

interface Props {
  note: ModerationNoteEntity;
}

const { note } = defineProps<Props>();
const memberStore = useMemberStore();
const { getMemberName } = memberStore;
const actorName = computed(() => getMemberName(note.actorUserId));
</script>

<template>
  <v-list-item>
    <div whitespace-pre-wrap break-words>{{ note.note }}</div>
    <v-list-item-subtitle>{{ actorName }} · <NuxtTime :datetime="note.createdAt" relative /></v-list-item-subtitle>
  </v-list-item>
</template>
