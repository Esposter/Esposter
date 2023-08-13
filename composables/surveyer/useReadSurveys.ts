import { useSurveyStore } from "@/store/surveyer/survey";
import { SURVEYER_STORE } from "@/services/surveyer/constants";

export const useReadSurveys = async () => {
  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const surveyStore = useSurveyStore();
  const { pushSurveyList, updateSurveyListNextCursor, initialiseSurveyList } = surveyStore;
  const { surveyListNextCursor } = storeToRefs(surveyStore);

  if (status.value === "authenticated") {
    const readMoreSurveys = async (onComplete: () => void) => {
      try {
        const { surveys, nextCursor } = await $client.surveyer.readSurveys.query({
          cursor: surveyListNextCursor.value,
        });
        pushSurveyList(surveys);
        updateSurveyListNextCursor(nextCursor);
      } finally {
        onComplete();
      }
    };

    const { surveys, nextCursor } = await $client.surveyer.readSurveys.query({ cursor: null });
    initialiseSurveyList(surveys);
    updateSurveyListNextCursor(nextCursor);
    return readMoreSurveys;
  }

  onMounted(() => {
    const surveyerStoreJson = localStorage.getItem(SURVEYER_STORE);
    if (surveyerStoreJson) initialiseSurveyList(jsonDateParse(surveyerStoreJson));
  });
};
