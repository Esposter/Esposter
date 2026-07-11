<script setup lang="ts">
import { getResultAsync } from "@esposter/shared";
import { useTheme } from "vuetify";

interface MermaidProps {
  code: string;
}

const { code } = defineProps<MermaidProps>();
const theme = useTheme();
const container = useTemplateRef("container");
const id = useId();

onMounted(async () => {
  const { default: mermaid } = await import("mermaid");
  mermaid.initialize({ startOnLoad: false, theme: theme.global.current.value.dark ? "dark" : "default" });
  const result = await getResultAsync(async () => {
    const { svg } = await mermaid.render(`mermaid-${id}`, code);
    return svg;
  });
  // On a parse failure we keep showing the raw diagram source
  if (result.isOk() && container.value) container.value.innerHTML = result.value;
});
</script>

<template>
  <div ref="container" flex justify-center overflow-x-auto py-2>
    <pre>{{ code }}</pre>
  </div>
</template>
