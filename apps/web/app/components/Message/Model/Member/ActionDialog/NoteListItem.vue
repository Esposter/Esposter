<script setup lang="ts">
import type { ModerationNoteEntity } from "@esposter/db-schema";

import { useMemberStore } from "@/store/message/user/member";

interface Props {
  note: ModerationNoteEntity;
}

const { note } = defineProps<Props>();
const memberStore = useMemberStore();
const { getMemberName } = memberStore;
</script>

<template>
  <li flex flex-col gap-1>
    <p ws-pre-wrap break-words>{{ note.note }}</p>
    <p text-sm text-muted>{{ getMemberName(note.actorUserId) }} · <NuxtTime :datetime="note.createdAt" relative /></p>
  </li>
</template>
