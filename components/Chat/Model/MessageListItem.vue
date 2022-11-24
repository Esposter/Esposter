<script setup lang="ts">
import type { MessageEntity } from "@/services/azure/types";
import { useMemberStore } from "@/store/useMemberStore";
import { storeToRefs } from "pinia";

interface MessageListItemProps {
  message: MessageEntity;
}

const props = defineProps<MessageListItemProps>();
const { message } = $(toRefs(props));
const memberStore = useMemberStore();
const { memberList } = $(storeToRefs(memberStore));
const member = $computed(() => memberList.find((m) => m.id === message.userId));
const isUpdateMode = $ref(false);
const isMessageActive = $ref(false);
const isOptionsActive = $ref(false);
const isOptionsChildrenActive = $ref(false);
const active = $computed(() => isMessageActive || isOptionsActive || isOptionsChildrenActive || isUpdateMode);
const activeAndNotUpdateMode = $computed(() => active && !isUpdateMode);
</script>

<template>
  <ChatConfirmDeleteMessageDialog :message="message">
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
          <DefaultAvatar v-else :name="member.username" />
        </template>
        <v-list-item-title font="bold!">
          {{ member.username }}
        </v-list-item-title>
        <ChatUpdatedMessage
          v-if="isUpdateMode"
          :message="message"
          @update:update-mode="(value) => (isUpdateMode = value)"
          @update-delete-mode="updateDeleteMode"
        />
        <v-list-item-subtitle v-else op="100!">
          {{ message.message }}
        </v-list-item-subtitle>
      </v-list-item>
      <div position="relative" z="1">
        <div
          v-show="activeAndNotUpdateMode"
          position="absolute"
          top="-6"
          right="0"
          @mouseenter="isOptionsActive = true"
          @mouseleave="isOptionsActive = false"
        >
          <v-hover v-slot="{ isHovering, props: hoverProps }">
            <ChatMessageOptionsMenu
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
      <v-list-item v-if="member">
        <template #prepend>
          <v-avatar v-if="member.avatar">
            <v-img :src="member.avatar" :alt="member.username" />
          </v-avatar>
          <DefaultAvatar v-else :name="member.username" />
        </template>
        <v-list-item-title font="bold!">
          {{ member.username }}
        </v-list-item-title>
        <v-list-item-subtitle op="100!">
          {{ message.message }}
        </v-list-item-subtitle>
      </v-list-item>
    </template>
  </ChatConfirmDeleteMessageDialog>
</template>
