<script setup lang="ts">
import type { SurveyAnswerValue, SurveyImageNode } from "vue-survey-engine-headless";

import { SURVEY_IMAGE_FIT_CLASSES } from "@/services/resource/survey/constants";

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
    :alt="node.props.altText"
    :class="SURVEY_IMAGE_FIT_CLASSES[node.props.imageFit]"
    :height="node.props.imageHeight"
    max-w-full
    :src="node.props.imageLink"
    :width="node.props.imageWidth"
  />
</template>
