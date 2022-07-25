<script setup lang="ts">
// @NOTE We shouldn't need this import
import MessageOptionsMenu from "@/components/Chat/MessageOptionsMenu.vue";
import { MessageEntity } from "@/services/azure/types";
import { useRoomStore } from "@/store/useRoomStore";

interface ChatMessageProps {
  message: MessageEntity;
}

const { message } = defineProps<ChatMessageProps>();
const { members } = useRoomStore();
const member = computed(() => members.find((m) => m.id === message.userId));
const isMessageActive = ref(false);
const isOptionsActive = ref(false);
const isOptionsChildrenActive = ref(false);
const active = computed(() => isMessageActive.value || isOptionsActive.value || isOptionsChildrenActive.value);
</script>

<template>
  <v-list-item
    v-if="member"
    :active="active"
    @mouseenter="isMessageActive = true"
    @mouseleave="isMessageActive = false"
  >
    <v-list-item-avatar start>
      <v-img :src="member.avatar" :alt="member.username" />
    </v-list-item-avatar>
    <v-list-item-header>
      <v-list-item-title font="bold!">
        {{ member.username }}
      </v-list-item-title>
      <v-list-item-subtitle op="100!">
        {{ message.message }}
      </v-list-item-subtitle>
    </v-list-item-header>
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
        />
      </v-hover>
    </div>
  </div>
</template>
