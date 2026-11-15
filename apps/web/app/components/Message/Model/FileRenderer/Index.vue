<script setup lang="ts">
import type { FileRendererComponentProps } from "#src/models/message/file/FileRendererComponentProps";

import { getLanguage } from "#src/services/codemirror/getLanguage";
import { getInferredMimetype } from "#src/services/file/getInferredMimetype";
import { CodeRenderer } from "#src/services/message/file/CodeRenderer";
import { DefaultRenderer } from "#src/services/message/file/DefaultRenderer";
import { TypeRendererMap } from "#src/services/message/file/TypeRendererMap";
import { takeOne } from "@esposter/shared";

const props = defineProps<FileRendererComponentProps>();
const { file } = toRefs(props);
const language = computed(() => getLanguage(file.value.filename));
const renderer = computed<Component>(() => {
  if (language.value) return CodeRenderer;
  else if (file.value.mimetype in TypeRendererMap) return takeOne(TypeRendererMap, file.value.mimetype);
  else {
    // The prefix alone — an image or a video of any specific format renders the same way
    const inferredMimetype = getInferredMimetype(file.value.mimetype);
    if (inferredMimetype in TypeRendererMap) return takeOne(TypeRendererMap, inferredMimetype);
    else return DefaultRenderer;
  }
});
</script>

<template>
  <component :is="renderer" :language :="props" />
</template>
