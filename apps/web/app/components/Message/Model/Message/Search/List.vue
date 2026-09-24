<script setup lang="ts">
import type { MessageEntity } from "@esposter/db-schema";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  messages: MessageEntity[];
}

defineSlots<{ default: () => VNode; "no-data": () => VNode }>();
const { messages } = defineProps<Props>();
</script>

<template>
  <template v-if="messages.length > 0">
    <div p-2 flex flex-1 flex-col gap-2 of-y-auto ui-body>
      <MessageModelMessageSearchListItem v-for="message in messages" :key="message.rowKey" :message />
      <slot />
    </div>
  </template>
  <slot v-else name="no-data">
    <UiEmptyState description="Try different keywords or filters." :meaning="UiIconMeaning.Search" title="No results" />
  </slot>
</template>
