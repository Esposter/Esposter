<script setup lang="ts">
import { mergeProps } from "vue";

interface MessageOptionsMenuProps {
  isHovering?: boolean;
  hoverProps?: object;
}

interface Item {
  title: string;
  icon: string;
  color?: string;
  onClick: (e: MouseEvent | KeyboardEvent) => void;
}

const props = defineProps<MessageOptionsMenuProps>();
const { isHovering, hoverProps } = $(toRefs(props));
const emit = defineEmits<{
  (event: "update", active: boolean): void;
  (event: "update:edit-message", active: true): void;
  (event: "update:delete-message", active: true): void;
}>();
const items: Item[] = [
  { title: "Edit Message", icon: "mdi-pencil", onClick: () => emit("update:edit-message", true) },
  { title: "Delete Message", icon: "mdi-delete", color: "error", onClick: () => emit("update:delete-message", true) },
];
</script>

<template>
  <v-card :elevation="isHovering ? 12 : 2" :="hoverProps">
    <v-card-actions p="0!" min-h="auto!">
      <v-menu
        transition="none"
        location="left"
        :close-on-content-click="false"
        @update:model-value="(value) => emit('update', value)"
      >
        <template #activator="{ props: menuProps }">
          <v-tooltip location="top" text="Add Reaction">
            <template #activator="{ props: tooltipProps }">
              <v-btn rd="0!" icon="mdi-emoticon" size="small" :="mergeProps(menuProps, tooltipProps)" />
            </template>
          </v-tooltip>
        </template>
        <ChatEmojiPicker :on-emoji-select="() => {}" />
      </v-menu>
      <v-btn m="0!" rd="0!" icon="mdi-pencil" size="small" @click="emit('update:edit-message', true)" />
      <v-menu transition="none" location="left" @update:model-value="(value) => emit('update', value)">
        <template #activator="{ props: menuProps }">
          <v-tooltip location="top" text="More">
            <template #activator="{ props: tooltipProps }">
              <v-btn m="0!" rd="0!" icon="mdi-dots-horizontal" size="small" :="mergeProps(menuProps, tooltipProps)" />
            </template>
          </v-tooltip>
        </template>
        <v-list>
          <v-list-item v-for="item in items" :key="item.title" @click="item.onClick">
            <span :class="item.color ? `text-${item.color}` : undefined">{{ item.title }}</span>
            <template #append>
              <v-icon size="small" :icon="item.icon" :color="item.color ?? undefined" />
            </template>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-card-actions>
  </v-card>
</template>
