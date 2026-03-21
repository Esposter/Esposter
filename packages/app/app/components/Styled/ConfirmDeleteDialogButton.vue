<script setup lang="ts">
import type { StyledDeleteFormDialogProps } from "@/components/Styled/DeleteFormDialog.vue";

const { cardProps } = defineProps<StyledDeleteFormDialogProps>();
const emit = defineEmits<{ delete: [onComplete: () => void] }>();
</script>

<template>
  <StyledDeleteFormDialog :card-props @delete="emit('delete', $event)">
    <template #activator="{ updateIsOpen }">
      <v-tooltip :text="cardProps?.title?.toString()">
        <template #activator="{ props }">
          <v-btn m-0 icon="mdi-delete" size="small" tile :="props" @click.stop="updateIsOpen(true)" />
        </template>
      </v-tooltip>
    </template>
  </StyledDeleteFormDialog>
</template>
