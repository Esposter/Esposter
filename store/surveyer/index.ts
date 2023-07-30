import type { SurveyConfiguration } from "@/models/surveyer/SurveyConfiguration";
import type { SurveyerConfiguration } from "@/models/surveyer/SurveyerConfiguration";
import { SURVEYER_STORE } from "@/services/surveyer/constants";

export const useSurveyerStore = defineStore("surveyer", () => {
  const { status } = useAuth();
  const surveyerConfiguration = ref<SurveyerConfiguration | null>(null);

  const createSurveyConfiguration = (newSurveyConfiguration: SurveyConfiguration) => {
    if (!surveyerConfiguration.value) return;

    surveyerConfiguration.value.push(newSurveyConfiguration);
    save();
  };

  const searchQuery = ref("");

  const save = () => {
    if (!surveyerConfiguration.value) return;
    // @NOTE: Implement saving data from blob when user is authed
    if (status.value === "authenticated") return;

    localStorage.setItem(SURVEYER_STORE, JSON.stringify(surveyerConfiguration.value));
  };

  return {
    surveyerConfiguration,
    createSurveyConfiguration,
    searchQuery,
    save,
  };
});
