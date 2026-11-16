<script setup lang="ts">
import type { SurveyAnswerValue, SurveyImageNode } from "vue-survey-engine-headless";

import { SURVEY_IMAGE_FIT_CLASSES } from "#src/services/resource/survey/constants";
import { omitUndefined } from "@esposter/shared";

interface Props {
  // A picture asks nothing, so it takes no error and is never disabled; both are taken so the chooser hands every kind
  // The same props
  error: string;
  isDisabled: boolean;
  node: SurveyImageNode;
}

// A picture holds no answer, and declaring the model keeps the chooser's binding from falling through onto the image
defineModel<SurveyAnswerValue | undefined>({ default: undefined });
defineProps<Props>();
</script>

<template>
  <!-- An empty alternative text is kept as an empty alt, which assistive technology takes as decoration -->
  <NuxtImg
    v-if="node.props.imageLink"
    :="omitUndefined({ height: node.props.imageHeight, width: node.props.imageWidth })"
    :alt="node.props.altText"
    :class="SURVEY_IMAGE_FIT_CLASSES[node.props.imageFit]"
    max-w-full
    :src="node.props.imageLink"
  />
</template>
