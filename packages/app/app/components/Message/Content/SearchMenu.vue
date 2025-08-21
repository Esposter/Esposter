<script setup lang="ts">
import type { MessageEntity } from "#shared/models/db/message/MessageEntity";

import { FilterType } from "#shared/models/message/FilterType";
import { FilterTypePlaceholderMap } from "@/services/message/FilterTypePlaceholderMap";
import { uncapitalize } from "@esposter/shared";

interface SearchMenuProps {
  hasMore: boolean;
  messages: MessageEntity[];
}

defineSlots<{ activator: (props: Record<string, unknown>) => unknown }>();
const { hasMore, messages } = defineProps<SearchMenuProps>();
const emit = defineEmits<{ readMore: []; select: [filterType: FilterType] }>();
const modelValue = defineModel<boolean>({ default: false });
</script>

<template>
  <v-menu v-model="modelValue" location="top" :close-on-content-click="false">
    <template #activator="{ props }">
      <slot name="activator" :="props" />
    </template>
    <StyledCard p-2>
      <v-card-title text-base font-extrabold>Search Options</v-card-title>
      <v-list py-0 density="compact">
        <v-hover v-for="filterType in Object.values(FilterType)" :key="filterType" #default="{ isHovering, props }">
          <v-list-item :="props" @click="emit('select', filterType)">
            <v-list-item-title font-bold>
              {{ uncapitalize(filterType) }}:
              <span font-semibold text-gray>{{ FilterTypePlaceholderMap[filterType] }}</span>
            </v-list-item-title>
            <template #append>
              <v-icon v-show="isHovering" icon="mdi-plus" />
            </template>
          </v-list-item>
        </v-hover>
      </v-list>
      <template v-if="messages.length > 0">
        <div mb-2 text-sm font-extrabold>History</div>
        <MessageModelMessageList :items="messages" />
        <div v-if="hasMore" py-2 flex justify-center>
          <v-btn variant="text" @click="emit('readMore')">Load more</v-btn>
        </div>
      </template>
    </StyledCard>
  </v-menu>
</template>
