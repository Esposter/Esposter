<script setup lang="ts">
import type { User } from "@/db/schema/users";
import type { MessageEntity } from "@/models/esbabbler/message";

interface MessageListItemProps {
  creator: User;
  message: MessageEntity;
}

const { message } = defineProps<MessageListItemProps>();
const messageHtml = computed(() => {
  const newMessage = useRefreshMentions(message.message);
  return newMessage;
});
const displayCreatedAt = useDateFormat(() => message.createdAt, "h:mm A");
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
  <EsbabblerModelMessageConfirmDeleteDialog :message>
    <template #default="{ isOpen, updateIsOpen }">
      <v-list-item
        v-if="creator.name"
        :active="active && !isOpen"
        @mouseenter="isMessageActive = true"
        @mouseleave="isMessageActive = false"
      >
        <template #prepend>
          <v-avatar v-if="creator.image">
            <v-img :src="creator.image" :alt="creator.name" />
          </v-avatar>
          <StyledDefaultAvatar v-else :name="creator.name" />
        </template>
        <v-list-item-title>
          <span font-bold>
            {{ creator.name }}
          </span>
          <span class="text-grey text-subtitle-2" pl-2>
            {{ displayCreatedAt }}
          </span>
        </v-list-item-title>
        <EsbabblerModelMessageEditor
          v-if="isUpdateMode"
          :message
          @update:update-mode="(value) => (isUpdateMode = value)"
          @update:delete-mode="updateIsOpen"
        />
        <v-list-item-subtitle v-else op="100!" v-html="messageHtml" />
        <EsbabblerModelMessageEmojiList :message-row-key="message.rowKey" />
      </v-list-item>
      <div relative z-1>
        <div
          v-show="activeAndNotUpdateMode && !isOpen"
          absolute
          right-0
          top--6
          @mouseenter="isOptionsActive = true"
          @mouseleave="isOptionsActive = false"
        >
          <v-hover #default="{ isHovering, props: hoverProps }">
            <EsbabblerModelMessageOptionsMenu
              :message
              :is-hovering
              :hover-props
              @update:menu="(value) => (isOptionsChildrenActive = value)"
              @update:update-mode="(value) => (isUpdateMode = value)"
              @update:delete-mode="updateIsOpen"
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
          <StyledDefaultAvatar v-else :name="creator.name" />
        </template>
        <v-list-item-title font-bold="!">
          {{ creator.name }}
        </v-list-item-title>
        <v-list-item-subtitle op="100!" v-html="messageHtml" />
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
  line-clamp: unset;
}

:deep(.ProseMirror) {
  height: auto;
  max-height: 15rem;
}
</style>
