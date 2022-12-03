<script setup lang="ts">
import { VCard } from "vuetify/components";

interface StyledDeleteProps {
  cardProps?: InstanceType<typeof VCard>["$props"];
}

const props = defineProps<StyledDeleteProps>();
const { cardProps } = $(toRefs(props));
const emit = defineEmits<{
  (event: "delete", onComplete: () => void): void;
}>();
const isDeleteMode = $ref(false);
</script>

<template>
  <slot :is-delete-mode="isDeleteMode" :update-delete-mode="(value: true) => isDeleteMode = value" />
  <v-dialog v-model="isDeleteMode" max-width="500">
    <v-card :="cardProps">
      <slot name="content" />
      <v-card-actions>
        <v-spacer />
        <v-btn px="6!" text="3" @click="isDeleteMode = false">Cancel</v-btn>
        <v-btn
          px="6!"
          text="3"
          variant="flat"
          color="error"
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
