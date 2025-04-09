<script setup lang="ts">
interface StyledClipboardButtonProps {
  source: string;
}

const { source } = defineProps<StyledClipboardButtonProps>();
const emit = defineEmits<{ copied: [boolean]; create: [] }>();
const { copied, copy } = useClipboard({ source });

watch(copied, (newCopied) => {
  emit("copied", newCopied);
});
</script>

<template>
  <v-btn v-if="copied" case-normal="!" color="primary">Copied</v-btn>
  <StyledButton v-else-if="source" @click="copy(source)">Copy</StyledButton>
  <StyledButton v-else @click="emit('create')">Create</StyledButton>
</template>
