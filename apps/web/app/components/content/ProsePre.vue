<script setup lang="ts">
interface Props {
  code?: string;
  language?: string;
}
// Shiki tags the <pre> with the class its injected stylesheet keys token colours off (html .shiki span),
// So the fallthrough attrs have to reach the <pre> rather than this wrapper — and the mermaid branch
// Must not inherit them at all, or that stylesheet also repaints the diagram's foreignObject labels
defineOptions({ inheritAttrs: false });
const { code = "", language } = defineProps<Props>();
</script>

<template>
  <DocsMermaid v-if="language === 'mermaid'" :code />
  <!-- Colours are github-dark's own pair (configuration/content.ts) — shiki emits no wrapper background,
    and code stays dark in both app themes, so a token cannot supply them -->
  <div v-else class="group code-block" my-4 relative bg="[#24292e]" c="[#e1e4e8]" rd="[var(--ui-container-radius)]">
    <UiCopyButton
      :source="code"
      op-0
      transition-opacity
      duration="[--transition-duration]"
      right-2
      top-2
      absolute
      focus:op-100
      group-hover:op-100
    />
    <pre :="$attrs" m-0 p-4 of-x-auto><slot /></pre>
  </div>
</template>

<style scoped>
/* Code keeps the mono face, whatever face the body reads in */
.code-block {
  font-family: var(--ui-font-mono);
}
</style>
