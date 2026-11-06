import { SurveyPublishState } from "#shared/models/pageBuilder/SurveyPublishState";
import { checkHasSurveyInvite } from "#shared/services/pageBuilder/critique/checkHasSurveyInvite";
import { critiqueWebpage } from "#shared/services/pageBuilder/critique/critiqueWebpage";
import { getCritiqueEditorFinding } from "@/services/pageBuilder/getCritiqueEditorFinding";
import { getNodePointer } from "@/services/pageBuilder/getNodePointer";
import { getNodeTitle } from "@/services/pageBuilder/getNodeTitle";
import { webpageKind } from "@/services/pageBuilder/webpageKind";
import { readBrowserColor } from "@/services/shared/readBrowserColor";
import { usePageBuilderDocumentStore } from "@/store/pageBuilder/document";
import { MAX_READ_LIMIT, parseJsonPointer } from "@esposter/shared";

// The critique of the open webpage, unsaved edits included, as the findings the problems surface lists. A survey is published
// When the owner's published surveys list it. Until that list is read, or when it is cut short before the survey, the invite is
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
  watchImmediate(isSurveyInvited, async (newIsSurveyInvited) => {
    if (newIsSurveyInvited) await refreshPublishedSurveys();
  });
  const lookupSurveyPublishState = (surveyId: string) => {
    const surveys = publishedSurveys.value;
    if (!surveys) return SurveyPublishState.Unreadable;
    if (surveys.items.some(({ id }) => id === surveyId)) return SurveyPublishState.Published;
    return surveys.hasMore ? SurveyPublishState.Unreadable : SurveyPublishState.Unpublished;
  };
  const critiqueSources = { lookupSurveyPublishState, readColor: readBrowserColor };
  // The critique as the problems surface's findings, computed once the document settles as every editor's check is. Each
  // Is a warning, and the save never reads them, so a finding informs and nothing waits on it
  const findings = useEditorFindings(
    () => getDocument(toValue(resourceId)),
    (document) => {
      if (!document) return [];

      return critiqueWebpage(document, critiqueSources).map((finding) => getCritiqueEditorFinding(finding));
    },
  );
  // The title of the node a finding names, as the layers tree titles it, or "" when the document holds no such node
  const getFindingNodeTitle = (nodeId: string) => {
    const document = getDocument(toValue(resourceId));
    if (!document) return "";

    const nodePointer = getNodePointer(webpageKind, document, nodeId);
    if (nodePointer === undefined) return "";

    return getNodeTitle(webpageKind, document, parseJsonPointer(nodePointer));
  };

  return { findings, getFindingNodeTitle };
};
