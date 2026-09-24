<script setup lang="ts">
import type { Resource } from "@esposter/db-schema";

import { pluralize } from "#shared/util/text/pluralize";
import { ResourceBladeSlug } from "@/models/resource/ResourceBladeSlug";
import { getResourceBladePath } from "@/services/resource/getResourceBladePath";
import { useSurveyStore } from "@/store/survey";

interface Props {
  resource: Resource;
}

const { resource } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const surveyStore = useSurveyStore();
const { loadContent } = surveyStore;
// Only isCapped renders the "1000+" form — an exactly-at-cap count is still an exact count
const responseLabel = computed(() => {
  if (!responseCount.value) return "";
  const { count, isCapped } = responseCount.value;
  return `${count}${isCapped ? "+" : ""} ${pluralize("response", count)}`;
});
// The page is keyed by resource id, so this instance only ever describes one survey — both reads run
// Once, in parallel. The Collection card edits the same content blob the editor writes, so it needs
// The loaded settings
const { data: responseCount } = useQuery(() => $trpc.survey.readSurveyResponsesCount.query({ id: resource.id }));
onMounted(() => loadContent());
</script>

<template>
  <ResourceOverview :resource>
    <template #essentials>
      <template v-if="responseCount">
        <span text-muted>Responses</span>
        <NuxtLink :to="getResourceBladePath(resource.id, ResourceBladeSlug.Responses)" text-info hover:underline>{{
          responseLabel
        }}</NuxtLink>
      </template>
    </template>
    <template #summary>
      <ResourceSurveyCollection />
    </template>
  </ResourceOverview>
</template>
