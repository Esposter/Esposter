<script setup lang="ts">
import type { ModerationNoteInRoom } from "#shared/models/db/room/ModerationNoteInRoom";

interface Props {
  note: ModerationNoteInRoom;
}

const { note } = defineProps<Props>();
</script>

<template>
  <li flex flex-col gap-1>
    <p ws-pre-wrap break-words>{{ note.note }}</p>
    <p text-sm text-muted>{{ note.actorDisplayName }} · <NuxtTime :datetime="note.createdAt" relative /></p>
  </li>
</template>
