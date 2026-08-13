<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

import { CodeRenderer, DefaultRenderer, TypeRendererMap } from "@/models/message/file/TypeRendererMap";
import { getLanguage } from "@/services/codemirror/getLanguage";
import { getInferredMimetype } from "@/services/file/getInferredMimetype";
import { takeOne } from "@esposter/shared";

const props = defineProps<FileRendererComponentProps>();
const { file } = toRefs(props);
const language = computed(() => getLanguage(file.value.filename));
const renderer = computed<Component>(() => {
  if (language.value) return CodeRenderer;
  else if (file.value.mimetype in TypeRendererMap) return takeOne(TypeRendererMap, file.value.mimetype);

  const inferredMimetype = getInferredMimetype(file.value.mimetype);
  if (inferredMimetype in TypeRendererMap) return takeOne(TypeRendererMap, inferredMimetype);
  else return DefaultRenderer;
});
</script>

<template>
  <component :is="renderer" :language :="props" />
</template>
