<script setup lang="ts">
// @NOTE We shouldn't need this import
import MessageOptionsMenu from "@/components/Chat/MessageOptionsMenu.vue";
import type { DeleteMessageInput } from "@/server/trpc/message";
import type { MessageEntity } from "@/services/azure/types";
import { useMemberStore } from "@/store/useMemberStore";
import { useMessageStore } from "@/store/useMessageStore";
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

interface ChatMessageProps {
  message: MessageEntity;
}

const props = defineProps<ChatMessageProps>();
const message = toRef(props, "message");
const currentMessage = ref(message.value.message);
const client = useClient();
const roomStore = useRoomStore();
const { updateMessage, deleteMessage } = useMessageStore();
const memberStore = useMemberStore();
const { members } = storeToRefs(memberStore);
const { currentRoomId } = storeToRefs(roomStore);
const member = computed(() => members.value.find((m) => m.id === message.value.userId));
const isMessageActive = ref(false);
const isOptionsActive = ref(false);
const isOptionsChildrenActive = ref(false);
const isEditMode = ref(false);
const isDeleteMode = ref(false);
const active = computed(
  () => isMessageActive.value || isOptionsActive.value || isOptionsChildrenActive.value || isEditMode.value
);
const onUpdateMessage = async (updateDeleteMode: (value: boolean) => void) => {
  try {
    if (!currentRoomId.value || currentMessage.value === message.value.message) return;
    if (!currentMessage.value) {
      updateDeleteMode(true);
      return;
    }

    const updatedMessage = await client.mutation("message.updateMessage", {
      partitionKey: message.value.partitionKey,
      rowKey: message.value.rowKey,
      message: currentMessage.value,
    });
    if (updatedMessage) updateMessage(updatedMessage);
  } finally {
    isEditMode.value = false;
    currentMessage.value = message.value.message;
  }
};
const onDeleteMessage = async () => {
  try {
    if (!currentRoomId) return;

    const deleteMessageInput: DeleteMessageInput = {
      partitionKey: message.value.partitionKey,
      rowKey: message.value.rowKey,
    };
    const result = await client.mutation("message.deleteMessage", deleteMessageInput);
    if (result) deleteMessage(deleteMessageInput);
  } finally {
    isDeleteMode.value = false;
  }
};
</script>

<template>
  <ChatDeleteMessageDialog :message="message">
    <template #message="{ updateDeleteMode }">
      <v-list-item
        v-if="member"
        :active="active"
        @mouseenter="isMessageActive = true"
        @mouseleave="isMessageActive = false"
      >
        <template #prepend>
          <v-avatar v-if="member.avatar">
            <v-img :src="member.avatar" :alt="member.username" />
          </v-avatar>
          <DefaultAvatar v-else />
        </template>
        <v-list-item-title font="bold!">
          {{ member.username }}
        </v-list-item-title>
        <div v-if="isEditMode">
          <!-- @NOTE We should be able to autofocus this when it appears -->
          <v-text-field
            density="compact"
            variant="solo"
            hide-details
            :model-value="currentMessage"
            @update:model-value="(value) => (currentMessage = value)"
            @keydown.enter="onUpdateMessage(updateDeleteMode)"
            @keydown.esc="isEditMode = false"
          />
          <span text="3"
            >escape to <span class="text-info underline" cursor="pointer" @click="isEditMode = false">cancel</span> •
            enter to
            <span class="text-info underline" cursor="pointer" @click="onUpdateMessage(updateDeleteMode)"
              >save</span
            ></span
          >
        </div>
        <v-list-item-subtitle v-else op="100!">
          {{ message.message }}
        </v-list-item-subtitle>
      </v-list-item>
    </template>
    <template #default="{ updateDeleteMode }">
      <div position="relative" z="1">
        <div
          v-show="active"
          position="absolute"
          top="-6"
          right="0"
          @mouseenter="isOptionsActive = true"
          @mouseleave="isOptionsActive = false"
        >
          <v-hover #default="{ isHovering, props }">
            <MessageOptionsMenu
              :isHovering="isHovering"
              :hoverProps="props"
              @update="(value) => (isOptionsChildrenActive = value)"
              @update:edit-message="(value) => (isEditMode = value)"
              @update:delete-message="updateDeleteMode"
            />
          </v-hover>
        </div>
      </div>
    </template>
  </ChatDeleteMessageDialog>
</template>
