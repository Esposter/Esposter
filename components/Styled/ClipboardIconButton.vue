<script setup lang="ts">
interface StyledClipboardIconButtonProps {
  source: string;
}

const { source } = defineProps<StyledClipboardIconButtonProps>();
const { copy, copied } = useClipboard({ source });
</script>

<template>
  <v-tooltip text="Copy">
    <template #activator="{ props: activatorProps }">
      <v-btn icon="mdi-clipboard" size="small" :="activatorProps" @click="copy(source)" />
    </template>
  </v-tooltip>
  <v-snackbar v-model="copied" color="primary">
    <div display="flex" flex="wrap" justify="center" items="center">
      Copied <v-code mx="2">{{ source }}</v-code> successfully!
    </div>
  </v-snackbar>
</template>
