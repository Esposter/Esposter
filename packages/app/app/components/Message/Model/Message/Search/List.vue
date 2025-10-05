<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

interface ListProps {
  messages: MessageEntity[];
}

defineSlots<{ default: () => VNode; "no-data": () => VNode }>();
const { messages } = defineProps<ListProps>();
</script>

<template>
  <template v-if="messages.length > 0">
    <div flex-1 overflow-y-auto="!">
      <v-list>
        <MessageModelMessageSearchListItem v-for="message in messages" :key="message.rowKey" :message />
      </v-list>
      <slot />
    </div>
  </template>
  <slot v-else name="no-data">
    <div pt-6 text-center text-gray>No results</div>
  </slot>
</template>
