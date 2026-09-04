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
const { copied, copy } = useClipboard({ source: code });
const COPY_BUTTON_PROPS = { color: "grey-lighten-1", density: "comfortable", size: "small", variant: "text" } as const;
</script>

<template>
  <DocsMermaid v-if="language === 'mermaid'" :code />
  <!-- Colours are github-dark's own pair (configuration/content.ts) — shiki emits no wrapper background,
    and code stays dark in both app themes, so a --v-theme token cannot supply them -->
  <!-- lh="[1.6]" not lh-1.6 — the bare number is spacing-scaled (calc(var(--spacing) * 1.6) = 0.4rem) -->
  <div v-else class="group" text-sm my-4 rd-lg relative overflow-hidden bg="[#24292e]" c="[#e1e4e8]" lh="[1.6]">
    <StyledTooltipIconButton
      op-0
      transition-opacity
      duration-[--transition-duration]
      right-2
      top-2
      absolute
      focus:op-100
      group-hover:op-100
      :button-props="COPY_BUTTON_PROPS"
      :icon="copied ? 'mdi-check' : 'mdi-content-copy'"
      :text="copied ? 'Copied' : 'Copy'"
      @click="copy()"
    />
    <pre :="$attrs" m-0 p-4 overflow-x-auto><slot /></pre>
  </div>
</template>
