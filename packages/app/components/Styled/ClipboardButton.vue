<script setup lang="ts">
interface StyledClipboardButtonProps {
  source: string;
}

const { source } = defineProps<StyledClipboardButtonProps>();
const { copied, copy } = useClipboard({ source });
</script>

<template>
  <v-btn v-if="copied" w-20 case-normal="!" color="primary">Copied</v-btn>
  <StyledButton v-else w-20 @click="copy(source)">Copy</StyledButton>
</template>
