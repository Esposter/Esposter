<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

interface SearchMenuProps {
  hasMore: boolean;
  messages: MessageEntity[];
}

defineSlots<{ activator: (props: Record<string, unknown>) => unknown }>();
const { hasMore, messages } = defineProps<SearchMenuProps>();
const emit = defineEmits<{ readMore: [] }>();
const modelValue = defineModel<boolean>({ default: false });
</script>

<template>
  <v-menu v-model="modelValue" location="top" :close-on-content-click="false">
    <template #activator="{ props }">
      <slot name="activator" :="props" />
    </template>
    <StyledCard pa-4>
      <div font-bold text-sm mb-2>Search Options</div>
      <div grid gap-3>
        <v-text-field label="from" placeholder="user" hide-details density="comfortable" />
        <v-text-field label="mentions" placeholder="user" hide-details density="comfortable" />
        <v-select :items="['link', 'embed', 'file']" label="has" hide-details density="comfortable" />
        <v-text-field type="date" label="before" hide-details density="comfortable" />
        <v-text-field type="date" label="during" hide-details density="comfortable" />
        <v-text-field type="date" label="after" hide-details density="comfortable" />
        <v-select :items="[true, false]" label="pinned" hide-details density="comfortable" />
        <v-select :items="['user', 'bot', 'webhook']" label="authorType" hide-details density="comfortable" />
      </div>
      <v-divider my-4 />
      <template v-if="messages.length > 0">
        <div font-bold text-sm mb-2>History</div>
        <EsbabblerModelMessageList :items="messages" />
        <div v-if="hasMore" py-2 flex justify-center>
          <v-btn variant="text" @click="emit('readMore')">Load more</v-btn>
        </div>
      </template>
    </StyledCard>
  </v-menu>
</template>
