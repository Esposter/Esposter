<script setup lang="ts">
interface StyledClipboardSnackbarProps {
  source: string;
}

const isCopied = defineModel<boolean>({ default: false });
const { source } = defineProps<StyledClipboardSnackbarProps>();
</script>

<template>
  <v-snackbar v-model="isCopied" color="primary">
    <div flex justify-center items-center flex-wrap>
      Copied <v-code mx-2>{{ source }}</v-code> successfully!
    </div>
  </v-snackbar>
</template>
