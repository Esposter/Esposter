<script setup lang="ts">
import { DEFAULT_CLOSED_MESSAGE } from "#shared/services/resource/survey/constants";
import { parseSurveyModel } from "#shared/services/survey/parseSurveyModel";
import { THEME_KEY } from "@/services/survey/constants";
import { getRouteParamString } from "@/util/router/getRouteParamString";
import { ResourceType, SurveyResponseMode } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";
import { Model } from "survey-core";
import { SurveyComponent } from "survey-vue3-ui";

interface ResourceSurveyViewProps {
  id: string;
  version?: number;
}

const { id, version } = defineProps<ResourceSurveyViewProps>();
const { $trpc } = useNuxtApp();
const route = useRoute();
// Read once on load and threaded through every write — the URL carries an opaque token or nothing
const participantToken = getRouteParamString(route.query.t);
const { clearSurveyResponseId, resumeSurveyResponse, saveSurveyResponse } = useSurveyResponse(id, participantToken);
const { content, name } = await useReadPublishedResourceContent(
  ResourceType.Survey,
  id,
  () =>
    version
      ? $trpc.survey.readPublishedVersionContent.query({ id, version })
      : $trpc.survey.readPublishedResourceContent.query(id),
  version,
);
// Settings arrive live on the public read, so closing or gating takes effect without a re-publish and
// The URL stays alive — unlike unpublish, which 404s every participant link already sent
const { closedMessage, isAcceptingResponses, responseMode } = content.settings;
const isParticipantTokenRequired = responseMode === SurveyResponseMode.Identified && !participantToken;
const { [THEME_KEY]: theme, ...surveyModel } = parseSurveyModel(content.model);
const model = new Model(surveyModel);
if (theme) model.applyTheme(theme);
model.onValueChanged.add(saveSurveyResponse);
model.onCurrentPageChanged.add(saveSurveyResponse);
model.onComplete.add(async (survey, { showSaveError, showSaveInProgress, showSaveSuccess }) => {
  showSaveInProgress();
  survey.clearIncorrectValues(true);
  await getResultAsync(() => saveSurveyResponse(survey)).match(
    () => {
      clearSurveyResponseId();
      showSaveSuccess();
    },
    (error) => showSaveError(error.message),
  );
});
useSeoMeta({ ogTitle: name, ogUrl: useRequestURL().href, title: name });

const isLoading = ref(true);

onMounted(async () => {
  if (isAcceptingResponses && !isParticipantTokenRequired) await resumeSurveyResponse(model);
  isLoading.value = false;
});
</script>

<template>
  <StyledEmptyState
    v-if="!isAcceptingResponses"
    icon="mdi-lock-outline"
    :title="name"
    :description="closedMessage || DEFAULT_CLOSED_MESSAGE"
  />
  <StyledEmptyState
    v-else-if="isParticipantTokenRequired"
    icon="mdi-email-lock-outline"
    :title="name"
    description="This survey is open to invited participants only. Please use the personal link you were sent."
  />
  <SurveyComponent v-else-if="!isLoading" :model />
</template>
