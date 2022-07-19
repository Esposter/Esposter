<script setup lang="ts">
interface MessageOptionsMenuProps {
  isHovering?: boolean;
  hoverProps?: object;
}

const { isHovering, hoverProps } = defineProps<MessageOptionsMenuProps>();
</script>

<template>
  <v-card :elevation="isHovering ? 12 : 2" :="hoverProps">
    <v-card-actions p="0!" min-h="auto!">
      <v-btn rd="0!" icon="mdi-emoticon" size="small" />
      <v-btn m="0!" rd="0!" rounded="full" icon="mdi-dots-horizontal" size="small" />
    </v-card-actions>
  </v-card>
</template>
