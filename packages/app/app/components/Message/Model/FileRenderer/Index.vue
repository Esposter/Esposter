<script setup lang="ts">
import type { FileRendererComponentProps } from "@/models/message/file/FileRendererComponentProps";

import { TypeRendererMap } from "@/models/message/file/TypeRendererMap";
import { getLanguage } from "@/services/codemirror/getLanguage";
import { getInferredMimetype } from "@/services/file/getInferredMimetype";
import { PREVIEW_MAX_HEIGHT } from "@/services/message/file/constants";
import { takeOne } from "@esposter/shared";

const props = defineProps<FileRendererComponentProps>();
const { file } = toRefs(props);
const language = computed(() => getLanguage(file.value.filename));
const renderer = computed<Component>(() => {
  if (language.value) return defineAsyncComponent(() => import("@/components/Message/Model/FileRenderer/Code.vue"));
  else if (file.value.mimetype in TypeRendererMap) return takeOne(TypeRendererMap, file.value.mimetype);

  const inferredMimetype = getInferredMimetype(file.value.mimetype);
  if (inferredMimetype in TypeRendererMap) return takeOne(TypeRendererMap, inferredMimetype);
  else return defineAsyncComponent(() => import("@/components/Message/Model/FileRenderer/Default.vue"));
});
</script>

<template>
  <v-skeleton-loader
    v-if="!props.url"
    size-full
    :height="props.isPreview ? PREVIEW_MAX_HEIGHT : '16rem'"
    type="image"
  />
  <div v-else-if="props.isPreview" bg-surface flex size-full min-h-0 items-center justify-center overflow-hidden>
    <component :is="renderer" :language :="props" />
  </div>
  <component :is="renderer" v-else :language :="props" />
</template>
