<script setup lang="ts">
import type { StyledDeleteDialogProps } from "@/components/Styled/DeleteDialog.vue";

const { cardProps } = defineProps<StyledDeleteDialogProps>();
const emit = defineEmits<{ delete: [onComplete: () => void] }>();
</script>

<template>
  <StyledDeleteDialog :card-props @delete="(onComplete) => emit('delete', onComplete)">
    <template #activator="{ updateIsOpen }">
      <v-tooltip :text="cardProps?.title?.toString()">
        <template #activator="{ props: tooltipProps }">
          <v-btn m-0="!" rd-none="!" icon="mdi-delete" size="small" :="tooltipProps" @click.stop="updateIsOpen(true)" />
        </template>
      </v-tooltip>
    </template>
  </StyledDeleteDialog>
</template>
