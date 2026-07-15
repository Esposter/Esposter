<script setup lang="ts">
import type { SurveyResponseEntity } from "@esposter/db-schema";

import { DEFAULT_CLOSED_MESSAGE } from "#shared/services/resource/survey/constants";
import { parseSurveyModel } from "#shared/services/survey/parseSurveyModel";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { THEME_KEY } from "@/services/survey/constants";
import { SurveyResponseMode } from "@esposter/db-schema";
import { getResultAsync } from "@esposter/shared";
import { Model } from "survey-core";
import { SurveyComponent } from "survey-vue3-ui";

interface ResourceSurveyViewProps {
  id: string;
}

const { id } = defineProps<ResourceSurveyViewProps>();
const { $trpc } = useNuxtApp();
const route = useRoute();
// Read once on load and threaded through every write — the URL carries an opaque token or nothing
const inviteToken = Array.isArray(route.query.t) ? (route.query.t[0] ?? "") : (route.query.t ?? "");

let surveyResponse: null | SurveyResponseEntity = null;

const executeMutation = useMutation();
// Server-generated response row (modelVersion) — non-optimistic, applied in onSuccess
const saveSurveyResponse = async (survey: Model) => {
  const responseModel = survey.data;
  responseModel.pageNo = survey.currentPageNo;
  const currentSurveyResponse = surveyResponse;
  if (!currentSurveyResponse) {
    const newSurveyResponseId = crypto.randomUUID();
    await executeMutation(
      () =>
        $trpc.survey.createSurveyResponse.mutate({
          inviteToken,
          model: responseModel,
          partitionKey: id,
          rowKey: newSurveyResponseId,
        }),
      {
        onSuccess: (newSurveyResponse) => {
          surveyResponse = newSurveyResponse;
          localStorage.setItem(LocalStorageKey.SurveyResponseId(id), newSurveyResponse.rowKey);
        },
      },
    );
    return;
  }

  await executeMutation(
    () =>
      $trpc.survey.updateSurveyResponse.mutate({
        inviteToken,
        model: responseModel,
        modelVersion: currentSurveyResponse.modelVersion,
        partitionKey: currentSurveyResponse.partitionKey,
        rowKey: currentSurveyResponse.rowKey,
      }),
    {
      onSuccess: (updatedSurveyResponse) => {
        surveyResponse = updatedSurveyResponse;
      },
    },
  );
};

const { content, name } = await getResultAsync(() => $trpc.survey.readPublishedResourceContent.query(id)).match(
  (publishedResource) => publishedResource,
  () => {
    throw createError({ statusCode: 404, statusMessage: "Survey not found" });
  },
);
// Settings arrive live on the public read, so closing or gating takes effect without a re-publish and
// The URL stays alive — unlike unpublish, which 404s every invite already sent
const { closedMessage, isAcceptingResponses, responseMode } = content.settings;
const isInviteRequired = responseMode === SurveyResponseMode.Invited && !inviteToken;
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
      // The resume id must not outlive the submission — a shared device could otherwise reopen the answers
      localStorage.removeItem(LocalStorageKey.SurveyResponseId(id));
      showSaveSuccess();
    },
    (error) => showSaveError(error.message),
  );
});
useSeoMeta({ ogTitle: name, ogUrl: useRequestURL().href, title: name });

const isLoading = ref(true);
// Respondent progress is tracked per browser, so an interrupted survey resumes where it left off
const onMount = async () => {
  const surveyResponseId = localStorage.getItem(LocalStorageKey.SurveyResponseId(id));
  if (!surveyResponseId) return;

  surveyResponse = await $trpc.survey.readSurveyResponse.query({ partitionKey: id, rowKey: surveyResponseId });
  if (!surveyResponse) return;

  model.data = surveyResponse.model;
  if (!surveyResponse.model.pageNo) return;
  model.currentPageNo = surveyResponse.model.pageNo as number;
};

onMounted(async () => {
  if (isAcceptingResponses && !isInviteRequired) await onMount();
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
    v-else-if="isInviteRequired"
    icon="mdi-email-lock-outline"
    :title="name"
    description="This survey is open to invited recipients only. Please use the link from your invite."
  />
  <SurveyComponent v-else-if="!isLoading" :model />
</template>
