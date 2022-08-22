<script setup lang="ts">
// @NOTE We shouldn't need these imports
import EditedMessage from "@/components/Chat/EditedMessage.vue";
import MessageOptionsMenu from "@/components/Chat/MessageOptionsMenu.vue";
import type { MessageEntity } from "@/services/azure/types";
import { useMemberStore } from "@/store/useMemberStore";
import { storeToRefs } from "pinia";

interface ChatMessageProps {
  message: MessageEntity;
}

const props = defineProps<ChatMessageProps>();
const message = toRef(props, "message");
const memberStore = useMemberStore();
const { memberList } = storeToRefs(memberStore);
const member = computed(() => memberList.value.find((m) => m.id === message.value.userId));
const isMessageActive = ref(false);
const isOptionsActive = ref(false);
const isOptionsChildrenActive = ref(false);
const isEditMode = ref(false);
const active = computed(
  () => isMessageActive.value || isOptionsActive.value || isOptionsChildrenActive.value || isEditMode.value
);
const activeNotEdit = computed(() => active.value && !isEditMode.value);
</script>

<template>
  <ChatDeleteMessageDialog :message="message">
    <template #default="{ isDeleteMode, updateDeleteMode }">
      <v-list-item
        v-if="member"
        :active="active && !isDeleteMode"
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
        <EditedMessage
          v-if="isEditMode"
          :message="message"
          :updateDeleteMode="updateDeleteMode"
          @update:edit-message="(value) => (isEditMode = value)"
        />
        <v-list-item-subtitle v-else op="100!">
          {{ message.message }}
        </v-list-item-subtitle>
      </v-list-item>
      <div position="relative" z="1">
        <div
          v-show="activeNotEdit"
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
    <template #messagePreview>
      <v-list-item v-if="member">
        <template #prepend>
          <v-avatar v-if="member.avatar">
            <v-img :src="member.avatar" :alt="member.username" />
          </v-avatar>
          <DefaultAvatar v-else />
        </template>
        <v-list-item-title font="bold!">
          {{ member.username }}
        </v-list-item-title>
        <v-list-item-subtitle op="100!">
          {{ message.message }}
        </v-list-item-subtitle>
      </v-list-item>
    </template>
  </ChatDeleteMessageDialog>
</template>
