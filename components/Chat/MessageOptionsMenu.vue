<script setup lang="ts">
import EmojiPicker from "@/components/Chat/EmojiPicker.vue";

interface MessageOptionsMenuProps {
  isHovering?: boolean;
  hoverProps?: object;
}

const { isHovering, hoverProps } = defineProps<MessageOptionsMenuProps>();
const emit = defineEmits<{ (event: "update", active: boolean): void }>();
</script>

<template>
  <v-card :elevation="isHovering ? 12 : 2" :="hoverProps">
    <v-card-actions p="0!" min-h="auto!">
      <v-menu transition="none" :close-on-content-click="false" @update:model-value="(value) => emit('update', value)">
        <template #activator="{ props }">
          <v-btn rd="0!" icon="mdi-emoticon" size="small" :="props" />
        </template>
        <EmojiPicker :onEmojiSelect="() => {}" />
      </v-menu>
      <v-btn m="0!" rd="0!" rounded="full" icon="mdi-dots-horizontal" size="small" />
    </v-card-actions>
  </v-card>
</template>
