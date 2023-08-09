import { SURVEYER_STORE } from "@/services/surveyer/constants";
import { useSurveyerStore } from "@/store/surveyer";

export default defineNuxtRouteMiddleware(async () => {
  if (isServer()) return;

  const { $client } = useNuxtApp();
  const { status } = useAuth();
  const surveyerStore = useSurveyerStore();
  const { surveyerConfiguration } = storeToRefs(surveyerStore);

  if (status.value === "authenticated") {
    surveyerConfiguration.value = await $client.surveyer.readSurveyer.query();
    return;
  }

  const surveyerStoreJson = localStorage.getItem(SURVEYER_STORE);
  surveyerConfiguration.value = surveyerStoreJson ? jsonDateParse(surveyerStoreJson) : [];
});
