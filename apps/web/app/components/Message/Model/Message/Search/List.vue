<script setup lang="ts">
import type { ClientMessage } from "@/models/message/ClientMessage";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";

interface Props {
  messages: ClientMessage[];
}

defineSlots<{ default: () => VNode; "no-data": () => VNode }>();
defineProps<Props>();
</script>

<template>
  <template v-if="messages.length > 0">
    <div p-2 flex flex-1 flex-col gap-2 of-y-auto ui-body>
      <MessageModelMessageSearchListItem v-for="message in messages" :key="message.id" :message />
      <slot />
    </div>
  </template>
  <slot v-else name="no-data">
    <UiEmptyState description="Try different keywords or filters." :meaning="UiIconMeaning.Search" title="No results" />
  </slot>
</template>
