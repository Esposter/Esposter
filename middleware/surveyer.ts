import { SURVEYER_STORE } from "@/services/surveyer/constants";
import { useSurveyerStore } from "@/store/surveyer";

export default defineNuxtRouteMiddleware(() => {
  const { status } = useAuth();
  // @NOTE: Implement loading data from blob when user is authed
  if (status.value === "authenticated") return;
  if (isServer()) return;

  const surveyerStore = useSurveyerStore();
  const { surveyerConfiguration } = storeToRefs(surveyerStore);
  const surveyerStoreJson = localStorage.getItem(SURVEYER_STORE);
  surveyerConfiguration.value = surveyerStoreJson ? jsonDateParse(surveyerStoreJson) : [];
});
