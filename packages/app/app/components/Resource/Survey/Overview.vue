<script setup lang="ts">
import type { CountSurveyResponsesOutput } from "#shared/models/resource/survey/CountSurveyResponsesOutput";
import type { Resource, ResourcePublication } from "@esposter/db-schema";

import { pluralize } from "#shared/util/text/pluralize";
import { useSurveyStore } from "@/store/survey";
import { getResultAsync, RoutePath } from "@esposter/shared";

interface ResourceSurveyOverviewProps {
  isLoading?: boolean;
  publication?: ResourcePublication;
  resource: Resource;
}

const { isLoading, publication, resource } = defineProps<ResourceSurveyOverviewProps>();
const { $trpc } = useNuxtApp();
const surveyStore = useSurveyStore();
const { loadContent } = surveyStore;
const responseCount = ref<CountSurveyResponsesOutput>();
// Only isCapped renders the "1000+" form — an exactly-at-cap count is still an exact count
const responseLabel = computed(() => {
  if (!responseCount.value) return "";
  const { count, isCapped } = responseCount.value;
  return `${count}${isCapped ? "+" : ""} ${pluralize("response", count)}`;
});

// The page is keyed by resource id, so this instance only ever describes one survey — both reads run
// Once, in parallel. The Collection card edits the same content blob the editor writes, so it needs
// The loaded settings
onMounted(async () => {
  const [, newResponseCount] = await Promise.all([
    loadContent(),
    getResultAsync(() => $trpc.survey.countSurveyResponses.query({ id: resource.id })).unwrapOr(undefined),
  ]);
  responseCount.value = newResponseCount;
});
</script>

<template>
  <ResourceOverview :is-loading :publication :resource>
    <template #essentials>
      <template v-if="responseCount">
        <span op-medium-emphasis>Responses</span>
        <NuxtLink :to="`${RoutePath.Resource(resource.id)}/responses`" text-info>{{ responseLabel }}</NuxtLink>
      </template>
    </template>
    <template #summary>
      <ResourceSurveyCollection />
    </template>
  </ResourceOverview>
</template>
