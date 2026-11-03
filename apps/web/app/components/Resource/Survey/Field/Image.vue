<script setup lang="ts">
import type { SurveyAnswerValue, SurveyImageNode } from "survey-engine";

import { SurveyImageFit } from "survey-engine";

interface Props {
  // A picture asks nothing, so it takes no error and is never disabled; both are taken so the chooser hands every kind
  // The same props
  error: string;
  isDisabled: boolean;
  node: SurveyImageNode;
}

// A picture holds no answer, and declaring the model keeps the chooser's binding from falling through onto the image
defineModel<SurveyAnswerValue | undefined>();
const { node } = defineProps<Props>();
// The fit states how the picture fills the box it is drawn in, which both of its dimensions constrain
const imageFitClassMap: Record<SurveyImageFit, string> = {
  [SurveyImageFit.Contain]: "object-contain",
  [SurveyImageFit.Cover]: "object-cover",
  [SurveyImageFit.Fill]: "object-fill",
  [SurveyImageFit.None]: "object-none",
};
</script>

<template>
  <!-- An empty alternative text is kept as an empty alt, which assistive technology takes as decoration -->
  <NuxtImg
    v-if="node.props.imageLink"
    :alt="node.props.altText"
    :class="imageFitClassMap[node.props.imageFit]"
    :height="node.props.imageHeight"
    max-w-full
    :src="node.props.imageLink"
    :width="node.props.imageWidth"
  />
</template>
