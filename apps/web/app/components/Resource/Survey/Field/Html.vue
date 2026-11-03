<script setup lang="ts">
import type { SurveyAnswerValue, SurveyHtmlNode } from "survey-engine";

import { sanitizeHtml } from "@esposter/shared";

interface Props {
  // A block of markup asks nothing, so it takes no error and is never disabled; both are taken so the chooser hands
  // Every kind the same props
  error: string;
  isDisabled: boolean;
  node: SurveyHtmlNode;
}

// A block holds no answer, and declaring the model keeps the chooser's binding from falling through onto the markup
defineModel<SurveyAnswerValue | undefined>({ default: undefined });
const { node } = defineProps<Props>();
// The markup is sanitised where it renders, as every markup a respondent reads is
const sanitizedHtml = computed(() => sanitizeHtml(node.props.html));
</script>

<template>
  <div v-html="sanitizedHtml" />
</template>
