import { SurveyPublishState } from "#shared/models/pageBuilder/SurveyPublishState";
import { checkHasSurveyInvite } from "#shared/services/pageBuilder/critique/checkHasSurveyInvite";
import { critiqueWebpage } from "#shared/services/pageBuilder/critique/critiqueWebpage";
import { getCritiqueFindingRow } from "@/services/pageBuilder/getCritiqueFindingRow";
import { readBrowserColor } from "@/services/pageBuilder/readBrowserColor";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { MAX_READ_LIMIT } from "@esposter/shared";

// The critique of the open webpage, unsaved edits included, as the rows the Check panel lists. A survey is published when
// The owner's published surveys list it. Until that list is read, or when it is cut short before the survey, the invite is
// Unchecked rather than reported as unpublished
export const usePageBuilderCritique = (resourceId: MaybeRefOrGetter<string>) => {
  const { $trpc } = useNuxtApp();
  const pageBuilderDocumentStore = usePageBuilderDocumentStore();
  const { getDocument } = pageBuilderDocumentStore;
  // Only an invite asks for a survey's state, so the list is read once the open page first holds one
  const { data: publishedSurveys, refresh: refreshPublishedSurveys } = useQuery(
    () => $trpc.survey.readResources.query({ isPublished: true, limit: MAX_READ_LIMIT }),
    { isInlineError: true, isLazy: true },
  );
  const isSurveyInvited = computed(() => {
    const document = getDocument(toValue(resourceId));
    return document !== undefined && checkHasSurveyInvite(document);
  });
  watch(
    isSurveyInvited,
    async (newIsSurveyInvited) => {
      if (newIsSurveyInvited) await refreshPublishedSurveys();
    },
    { immediate: true },
  );
  const lookupSurveyPublishState = (surveyId: string) => {
    const surveys = publishedSurveys.value;
    if (!surveys) return SurveyPublishState.Unreadable;
    if (surveys.items.some(({ id }) => id === surveyId)) return SurveyPublishState.Published;
    return surveys.hasMore ? SurveyPublishState.Unreadable : SurveyPublishState.Unpublished;
  };
  const critiqueRows = computed(() => {
    const document = getDocument(toValue(resourceId));
    if (!document) return [];

    return critiqueWebpage(document, { lookupSurveyPublishState, readColor: readBrowserColor }).map((finding) =>
      getCritiqueFindingRow(document, finding),
    );
  });

  return { critiqueRows };
};
