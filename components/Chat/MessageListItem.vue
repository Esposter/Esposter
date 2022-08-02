<script setup lang="ts">
// @NOTE We shouldn't need this import
import MessageOptionsMenu from "@/components/Chat/MessageOptionsMenu.vue";
import type { DeleteMessageInput, UpdateMessageInput } from "@/server/trpc/message";
import type { MessageEntity } from "@/services/azure/types";
import { useRoomStore } from "@/store/useRoomStore";
import { storeToRefs } from "pinia";

interface ChatMessageProps {
  message: MessageEntity;
}

const { message } = defineProps<ChatMessageProps>();
const client = useClient();
const roomStore = useRoomStore();
const { currentRoomId, updateMessage, deleteMessage } = roomStore;
const { members } = storeToRefs(roomStore);
const member = computed(() => members.value.find((m) => m.id === message.userId));
const currentMessage = ref(message.message);
const isMessageActive = ref(false);
const isOptionsActive = ref(false);
const isOptionsChildrenActive = ref(false);
const isEditMode = ref(false);
const isDeleteMode = ref(false);
const active = computed(
  () => isMessageActive.value || isOptionsActive.value || isOptionsChildrenActive.value || isEditMode.value
);
const onUpdateMessage = async () => {
  isEditMode.value = false;
  if (currentMessage.value !== message.message && currentRoomId) {
    const updateMessageInput: UpdateMessageInput = {
      partitionKey: message.partitionKey,
      rowKey: message.rowKey,
      message: currentMessage.value,
    };
    updateMessage(updateMessageInput);
    await client.mutation("message.updateMessage", updateMessageInput);
  }
};
const onDeleteMessage = async () => {
  isDeleteMode.value = false;
  if (currentRoomId) {
    const deleteMessageInput: DeleteMessageInput = {
      partitionKey: message.partitionKey,
      rowKey: message.rowKey,
    };
    deleteMessage(deleteMessageInput);
    await client.mutation("message.deleteMessage", deleteMessageInput);
  }
};
</script>

<template>
  <v-list-item
    v-if="member"
    :active="active"
    @mouseenter="isMessageActive = true"
    @mouseleave="isMessageActive = false"
  >
    <template #prepend>
      <v-avatar>
        <v-img :src="member.avatar" :alt="member.username" />
      </v-avatar>
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
        @keydown.enter="onUpdateMessage"
        @keydown.esc="isEditMode = false"
      />
      <span text="3"
        >escape to <span class="text-info underline" cursor="pointer" @click="isEditMode = false">cancel</span> • enter
        to <span class="text-info underline" cursor="pointer" @click="onUpdateMessage">save</span></span
      >
    </div>
    <v-list-item-subtitle v-else op="100!">
      {{ message.message }}
    </v-list-item-subtitle>
  </v-list-item>
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
          @update:delete-message="(value) => (isDeleteMode = value)"
        />
      </v-hover>
    </div>
  </div>
  <v-dialog v-model="isDeleteMode">
    <v-card title="Delete Message" text="Are you sure you want to delete this message?">
      <div m="x-4" rd="2" border>
        <v-list-item v-if="member">
          <template #prepend>
            <v-avatar>
              <v-img :src="member.avatar" :alt="member.username" />
            </v-avatar>
          </template>
          <v-list-item-title font="bold!">
            {{ member.username }}
          </v-list-item-title>
          <v-list-item-subtitle op="100!">
            {{ message.message }}
          </v-list-item-subtitle>
        </v-list-item>
      </div>
      <v-card-actions>
        <v-spacer />
        <v-btn p="x-6!" text="3" @click="isDeleteMode = false">Cancel</v-btn>
        <v-btn p="x-6!" text="3" variant="flat" color="error" @click="onDeleteMessage">Delete</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
