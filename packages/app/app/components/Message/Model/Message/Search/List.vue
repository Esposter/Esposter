<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

interface SearchListProps {
  messages: MessageEntity[];
}

defineSlots<{ default: () => VNode; "no-data": () => VNode }>();
const { messages } = defineProps<SearchListProps>();
</script>

<template>
  <template v-if="messages.length > 0">
    <div flex-1 overflow-y-auto>
      <v-list>
        <MessageModelMessageSearchListItem v-for="message in messages" :key="message.rowKey" :message />
      </v-list>
      <slot />
    </div>
  </template>
  <slot v-else name="no-data">
    <StyledEmptyState description="Try different keywords or filters." icon="mdi-magnify" title="No results" />
  </slot>
</template>
