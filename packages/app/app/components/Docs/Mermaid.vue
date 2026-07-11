<script setup lang="ts">
import { getResultAsync } from "@esposter/shared";
import mermaid from "mermaid";
import { useTheme } from "vuetify";

interface MermaidProps {
  code: string;
}

const { code } = defineProps<MermaidProps>();
const theme = useTheme();
const container = useTemplateRef("container");
const id = useId();

onMounted(async () => {
  mermaid.initialize({ startOnLoad: false, theme: theme.global.current.value.dark ? "dark" : "default" });
  const result = await getResultAsync(async () => {
    const { svg } = await mermaid.render(`mermaid-${id}`, code);
    return svg;
  });
  // On a render failure we keep showing the raw diagram source
  result.match((svg) => {
    if (container.value) container.value.innerHTML = svg;
  }, console.error);
});
</script>

<template>
  <div ref="container" py-2 flex justify-center overflow-x-auto>
    <pre>{{ code }}</pre>
  </div>
</template>
