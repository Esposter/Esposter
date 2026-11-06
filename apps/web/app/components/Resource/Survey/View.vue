<script setup lang="ts">
import type { SurveyAnswers } from "vue-survey-engine-headless";

import {
  DEFAULT_CLOSED_MESSAGE,
  DEFAULT_COMPLETED_MESSAGE,
  INVITE_ONLY_MESSAGE,
} from "#shared/services/resource/survey/constants";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getRouteParamString } from "@/util/router/getRouteParamString";
import { ResourceType, SurveyResponseMode } from "@esposter/db-schema";
import { sanitizeHtml } from "@esposter/shared";
import { flattenSurveyQuestions } from "vue-survey-engine-headless";

interface Props {
  id: string;
}

const { id } = defineProps<Props>();
const { $trpc } = useNuxtApp();
const { currentRoute } = useRouter();
// Read once on load and threaded through every write — the URL carries an opaque token or nothing
const participantToken = getRouteParamString(currentRoute.value.query.t);
const { clearSurveyResponseId, resumeSurveyResponse, saveSurveyResponse, seed } = useSurveyResponse(
  id,
  participantToken,
);
const { content, name } = await useReadPublishedResourceContent(
  ResourceType.Survey,
  id,
  () => $trpc.survey.readPublishedResourceContent.query(id),
  (version) => $trpc.survey.readPublishedVersionContent.query({ id, version }),
);
// Settings arrive live on the public read, so closing or gating takes effect without a re-publish and
// The URL stays alive — unlike unpublish, which 404s every participant link already sent
const { closedMessage, isAcceptingResponses, responseMode } = content.settings;
const isParticipantTokenRequired = responseMode === SurveyResponseMode.Identified && !participantToken;
// An author's completion markup renders into this page, in the app's own origin, for anonymous respondents
const completedHtml = sanitizeHtml(content.document.root.props.completedHtml);
// A republish between a draft and its resume can remove a question, so a resumed draft keeps only the answers
// To the questions the published document still holds
const questionNames = new Set(flattenSurveyQuestions(content.document.content).map(({ props }) => props.name));
// The page the runner last reported. The runner reports every move, so this is the page a submit completes on
let lastPageIndex = 0;
const resumedDraft = ref<{ answers: SurveyAnswers; pageIndex: number; seed: string }>();
const isLoading = ref(true);
const isSubmitted = ref(false);
const isSubmitFailed = ref(false);

// Every answer and page move saves a draft, so a respondent who leaves resumes where they were
const onChange = ({ answers, pageIndex }: { answers: SurveyAnswers; pageIndex: number }) => {
  lastPageIndex = pageIndex;
  return saveSurveyResponse({ answers, isSubmitting: false, pageIndex });
};
// Only a save that actually persisted may clear the resume id and thank the respondent — the mutation reports a
// Rejection rather than throwing, so a failed submit would otherwise wipe the id their answers are stored under
// And send them back to a blank survey
const onComplete = async (answers: SurveyAnswers) => {
  isSubmitFailed.value = false;
  if (await saveSurveyResponse({ answers, isSubmitting: true, pageIndex: lastPageIndex })) {
    clearSurveyResponseId();
    isSubmitted.value = true;
  } else isSubmitFailed.value = true;
};

onMounted(async () => {
  if (isAcceptingResponses && !isParticipantTokenRequired) {
    const draft = await resumeSurveyResponse();
    if (draft) {
      lastPageIndex = draft.pageIndex;
      resumedDraft.value = {
        ...draft,
        answers: Object.fromEntries(
          Object.entries(draft.answers).filter(([questionName]) => questionNames.has(questionName)),
        ),
      };
    }
  }
  isLoading.value = false;
});
</script>

<template>
  <UiEmptyState
    v-if="!isAcceptingResponses"
    :description="closedMessage || DEFAULT_CLOSED_MESSAGE"
    :meaning="UiIconMeaning.Lock"
    :title="name"
  />
  <UiEmptyState
    v-else-if="isParticipantTokenRequired"
    :description="INVITE_ONLY_MESSAGE"
    :meaning="UiIconMeaning.Lock"
    :title="name"
  />
  <!-- A respondent resuming a draft waits for their answers rather than an empty survey that fills in under them -->
  <div v-else-if="isLoading" p-4 flex flex-col gap-4>
    <UiSkeleton h-8 w="1/2" />
    <UiSkeleton v-for="index of 3" :key="index" h-24 />
  </div>
  <div v-else-if="isSubmitted" flex flex-col gap-4 ui-body>
    <div v-if="completedHtml" v-html="completedHtml" />
    <p v-else>{{ DEFAULT_COMPLETED_MESSAGE }}</p>
  </div>
  <template v-else>
    <UiAlert v-if="isSubmitFailed" status="error">We could not submit your answers. Please try again.</UiAlert>
    <ResourceSurveyRunner
      :document="content.document"
      :initial-answers="resumedDraft?.answers"
      :initial-page-index="resumedDraft?.pageIndex"
      :seed="resumedDraft?.seed ?? seed"
      @change="(value) => onChange(value)"
      @complete="(answers) => onComplete(answers)"
    />
  </template>
</template>
