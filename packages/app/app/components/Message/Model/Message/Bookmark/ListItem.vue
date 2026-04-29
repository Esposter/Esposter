<script setup lang="ts">
import type { Creator } from "@/models/message/Creator";
import type { MessageEntity } from "@esposter/db-schema";

import { MessageComponentMap } from "@/services/message/MessageComponentMap";

interface BookmarkListItemProps {
  creator: Creator;
  message: MessageEntity;
  to: string;
}

const { creator, message, to } = defineProps<BookmarkListItemProps>();
const emit = defineEmits<{ delete: [] }>();
</script>

<template>
  <div relative cursor-pointer @click="navigateTo(to)">
    <component :is="MessageComponentMap[message.type]" :creator :message is-preview />
    <div absolute right-2 top-2 z-1>
      <v-tooltip text="Remove Bookmark">
        <template #activator="{ props: tooltipProps }">
          <v-btn
            icon="mdi-bookmark-remove"
            variant="text"
            size="small"
            color="error"
            :="tooltipProps"
            @click.stop="emit('delete')"
          />
        </template>
      </v-tooltip>
    </div>
  </div>
</template>
