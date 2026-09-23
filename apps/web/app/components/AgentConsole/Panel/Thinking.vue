<script setup lang="ts">
interface Props {
  isStreaming?: true;
  text: string;
}

const { isStreaming, text } = defineProps<Props>();
const isOpen = ref(false);
const { text: selectedText } = useTextSelection();
</script>

<template>
  <!-- A block written with no text, as the terminal writes every one it keeps, has nothing to open onto -->
  <p v-if="!text && !isStreaming" class="muted">✻ Thinking · no text recorded</p>
  <!-- Folded, as Claude folds it, and a click anywhere on it toggles it, the text included, unless the click ends a -->
  <!-- Selection being made in that text; it brightens under the pointer so it reads as something that opens -->
  <details v-else :open="isOpen" @toggle="isOpen = ($event.target as HTMLDetailsElement).open">
    <summary class="muted" cursor-pointer hover:brightness-150>✻ Thinking{{ isStreaming ? "…" : "" }}</summary>
    <p
      class="muted"
      cursor-pointer
      ws-pre-wrap
      hover:brightness-150
      @click="
        () => {
          if (!selectedText) isOpen = false;
        }
      "
    >
      {{ text }}
    </p>
  </details>
</template>

<style scoped>
.muted {
  color: var(--agent-console-muted);
}
</style>
