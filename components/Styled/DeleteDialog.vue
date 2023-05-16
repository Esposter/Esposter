<script setup lang="ts">
import type { VCard } from "vuetify/components";

interface StyledDeleteDialogProps {
  cardProps?: InstanceType<typeof VCard>["$props"];
}

export interface StyledDeleteDialogDefaultSlotProps {
  isDeleteMode: boolean;
  updateDeleteMode: (value: true) => boolean;
}

defineSlots<{
  default: (props: StyledDeleteDialogDefaultSlotProps) => unknown;
  content: (props: {}) => unknown;
}>();
const props = defineProps<StyledDeleteDialogProps>();
const { cardProps } = toRefs(props);
const emit = defineEmits<{
  delete: [onComplete: () => void];
}>();
const isDeleteMode = ref(false);
</script>

<template>
  <v-dialog v-model="isDeleteMode">
    <template #activator>
      <slot :is-delete-mode="isDeleteMode" :update-delete-mode="(value: true) => (isDeleteMode = value)" />
    </template>
    <v-card :="cardProps">
      <slot name="content" />
      <v-card-actions>
        <v-spacer />
        <v-btn text="3" variant="outlined" @click="isDeleteMode = false">Cancel</v-btn>
        <v-btn
          text="3"
          color="error"
          variant="outlined"
          @click="
            emit('delete', () => {
              isDeleteMode = false;
            })
          "
        >
          Delete
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
