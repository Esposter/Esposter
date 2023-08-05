<script setup lang="ts">
interface StyledClipboardButtonProps {
  source: string;
}

const props = defineProps<StyledClipboardButtonProps>();
const { source } = toRefs(props);
const { copy, copied } = useClipboard({ source: source.value });
</script>

<template>
  <v-btn v-if="copied" w="20" case="normal!" color="primary">Copied</v-btn>
  <StyledButton v-else w="20" @click="copy(source)">Copy</StyledButton>
</template>
