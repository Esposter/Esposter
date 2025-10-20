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
  <v-btn v-if="copied" color="primary" text="Copied" />
  <StyledButton v-else-if="source" :button-props="{ text: 'Copy' }" @click="copy(source)" />
  <StyledButton v-else :button-props="{ text: 'Create' }" @click="emit('create')" />
</template>
