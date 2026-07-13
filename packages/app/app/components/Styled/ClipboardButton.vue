<script setup lang="ts">
interface StyledClipboardButtonProps {
  source: string;
}

const { source } = defineProps<StyledClipboardButtonProps>();
const emit = defineEmits<{ create: []; "update:copied": [boolean] }>();
const { copied, copy } = useClipboard({ source });

watch(copied, (newCopied) => {
  emit("update:copied", newCopied);
});
</script>

<template>
  <StyledButton v-if="copied" :button-props="{ text: 'Copied' }" />
  <StyledButton v-else-if="source" :button-props="{ text: 'Copy' }" @click="copy(source)" />
  <StyledButton v-else :button-props="{ text: 'Create' }" @click="emit('create')" />
</template>
