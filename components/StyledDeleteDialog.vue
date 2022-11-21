<script setup lang="ts">
interface StyledDeleteProps {
  title: string;
  text: string;
}

// @NOTE: Will be fixed in Vue 3.3
// const props = defineProps<typeof VCard>();
const props = defineProps<StyledDeleteProps>();
const { title, text } = $(toRefs(props));
const emit = defineEmits<{
  (event: "delete", onComplete: () => void): void;
}>();
const isDeleteMode = $ref(false);
</script>

<template>
  <slot :is-delete-mode="isDeleteMode" :update-delete-mode="(value: true) => isDeleteMode = value" />
  <v-dialog v-model="isDeleteMode" max-width="500">
    <v-card :title="title" :text="text">
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
