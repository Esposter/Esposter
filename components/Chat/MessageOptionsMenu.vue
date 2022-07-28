<script setup lang="ts">
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
      <!-- <v-menu
        transition="none"
        location="left"
        :close-on-content-click="false"
        @update:model-value="(value) => emit('update', value)"
      >
        <template #activator="{ props: menuProps }">
          <v-tooltip location="top" text="Add Reaction">
            <template #activator="{ props: tooltipProps }"> -->
      <v-btn rd="0!" icon="mdi-emoticon" size="small" />
      <!-- </template>
          </v-tooltip>
        </template>
        <ChatEmojiPicker :onEmojiSelect="() => {}" />
      </v-menu> -->
      <!-- <v-menu location="left">
        <template #activator="{ props: menuProps }">
          <v-tooltip location="top" text="More">
            <template #activator="{ props: tooltipProps }"> -->
      <v-btn m="0!" rd="0!" icon="mdi-dots-horizontal" size="small" />
      <!-- </template>
          </v-tooltip>
        </template>
      </v-menu> -->
    </v-card-actions>
  </v-card>
</template>
