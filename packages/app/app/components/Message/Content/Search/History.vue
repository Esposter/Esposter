<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

defineProps<{ messages: MessageEntity[] }>();
</script>

<template>
  <div mb-2 text-sm font-extrabold>History</div>
  <MessageModelMessageList :messages />
</template>
