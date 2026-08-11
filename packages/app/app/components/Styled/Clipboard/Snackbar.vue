<script setup lang="ts">
import { useClipboardStore } from "@/store/clipboard";

// Mounted once, in `app.vue`. It takes no props: what was copied is the clipboard store's own state, and a
// Snackbar told the source separately could report a different string from the one on the clipboard
const clipboardStore = useClipboardStore();
const { copied, text } = storeToRefs(clipboardStore);
</script>

<template>
  <v-snackbar v-model="copied" color="primary">
    <div flex flex-wrap items-center justify-center>
      Copied <v-code mx-2>{{ text }}</v-code> successfully!
    </div>
  </v-snackbar>
</template>
