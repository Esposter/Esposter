<script setup lang="ts">
import type { MessageEntity } from "@/models/esbabbler/message";
import { refreshMentions } from "@/services/esbabbler/mention";
import type { User } from "@prisma/client";
import dayjs from "dayjs";
import DOMPurify from "dompurify";

interface MessageListItemProps {
  message: MessageEntity;
  creator: User;
}

const props = defineProps<MessageListItemProps>();
const { message } = toRefs(props);
const sanitizedMessageHtml = computed(() => {
  const newMessage = refreshMentions(message.value.message);
  return DOMPurify.sanitize(newMessage);
});
const displayCreatedAt = computed(() => dayjs(message.value.createdAt).format("h:mm A"));
const isUpdateMode = ref(false);
const isMessageActive = ref(false);
const isOptionsActive = ref(false);
const isOptionsChildrenActive = ref(false);
const active = computed(
  () => isMessageActive.value || isOptionsActive.value || isOptionsChildrenActive.value || isUpdateMode.value,
);
const activeAndNotUpdateMode = computed(() => active.value && !isUpdateMode.value);
</script>

<template>
  <EsbabblerModelMessageConfirmDeleteDialog :message="message">
    <template #default="{ isDeleteMode, updateDeleteMode }">
      <v-list-item
        v-if="creator.name"
        :active="active && !isDeleteMode"
        @mouseenter="isMessageActive = true"
        @mouseleave="isMessageActive = false"
      >
        <template #prepend>
          <v-avatar v-if="creator.image">
            <v-img :src="creator.image" :alt="creator.name" />
          </v-avatar>
          <DefaultAvatar v-else :name="creator.name" />
        </template>
        <v-list-item-title>
          <span font="bold">
            {{ creator.name }}
          </span>
          <span class="text-subtitle-2" pl="2" op="60">
            {{ displayCreatedAt }}
          </span>
        </v-list-item-title>
        <EsbabblerModelMessageEditor
          v-if="isUpdateMode"
          :message="message"
          @update:update-mode="(value) => (isUpdateMode = value)"
          @update:delete-mode="updateDeleteMode"
        />
        <v-list-item-subtitle v-else op="100!" v-html="sanitizedMessageHtml" />
        <EsbabblerModelMessageEmojiList :message-row-key="message.rowKey" />
      </v-list-item>
      <div position="relative" z="1">
        <div
          v-show="activeAndNotUpdateMode && !isDeleteMode"
          position="absolute"
          top="-6"
          right="0"
          @mouseenter="isOptionsActive = true"
          @mouseleave="isOptionsActive = false"
        >
          <v-hover v-slot="{ isHovering, props: hoverProps }">
            <EsbabblerModelMessageOptionsMenu
              :message="message"
              :is-hovering="isHovering"
              :hover-props="hoverProps"
              @update:menu="(value) => (isOptionsChildrenActive = value)"
              @update:update-mode="(value) => (isUpdateMode = value)"
              @update:delete-mode="updateDeleteMode"
            />
          </v-hover>
        </div>
      </div>
    </template>
    <template #messagePreview>
      <v-list-item v-if="creator.name">
        <template #prepend>
          <v-avatar v-if="creator.image">
            <v-img :src="creator.image" :alt="creator.name" />
          </v-avatar>
          <DefaultAvatar v-else :name="creator.name" />
        </template>
        <v-list-item-title font="bold!">
          {{ creator.name }}
        </v-list-item-title>
        <v-list-item-subtitle op="100!" v-html="sanitizedMessageHtml" />
        <EsbabblerModelMessageEmojiList :message-row-key="message.rowKey" />
      </v-list-item>
    </template>
  </EsbabblerModelMessageConfirmDeleteDialog>
</template>

<style scoped lang="scss">
:deep(.v-list-item__prepend) {
  align-self: flex-start;
}

:deep(.v-list-item__content) {
  overflow: visible;
}

// We don't want to hide message content even if they added a bunch of newlines
:deep(.v-list-item-subtitle) {
  -webkit-line-clamp: unset;
}

:deep(.ProseMirror) {
  height: auto;
  max-height: 15rem;
}
</style>
