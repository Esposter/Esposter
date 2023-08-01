<script setup lang="ts">
import type { StyledDeleteDialogProps } from "@/components/Styled/DeleteDialog.vue";

const props = defineProps<StyledDeleteDialogProps>();
const { cardProps } = toRefs(props);
const emit = defineEmits<{ delete: [onComplete: () => void] }>();
</script>

<template>
  <StyledDeleteDialog :card-props="cardProps" @delete="(onComplete) => emit('delete', onComplete)">
    <template #default="{ updateDeleteMode }">
      <v-tooltip :text="cardProps?.title">
        <template #activator="{ props: tooltipProps }">
          <v-btn m="0!" rd="0!" icon="mdi-delete" size="small" :="tooltipProps" @click="updateDeleteMode(true)" />
        </template>
      </v-tooltip>
    </template>
  </StyledDeleteDialog>
</template>
