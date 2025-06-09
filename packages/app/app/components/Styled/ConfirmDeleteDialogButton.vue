<script setup lang="ts">
import type { StyledDeleteDialogProps } from "@/components/Styled/DeleteDialog.vue";

const { cardProps } = defineProps<StyledDeleteDialogProps>();
const emit = defineEmits<{ delete: [onComplete: () => void] }>();
</script>

<template>
  <StyledDeleteDialog :card-props @delete="emit('delete', $event)">
    <template #activator="{ updateIsOpen }">
      <v-tooltip :text="cardProps?.title?.toString()">
        <template #activator="{ props }">
          <v-btn m-0="!" rd-none="!" icon="mdi-delete" size="small" :="props" @click.stop="updateIsOpen(true)" />
        </template>
      </v-tooltip>
    </template>
  </StyledDeleteDialog>
</template>
