import type { Survey } from "@/models/surveyer/Survey";
import type { SurveyerConfiguration } from "@/models/surveyer/SurveyerConfiguration";
import { SURVEYER_STORE } from "@/services/surveyer/constants";

export const useSurveyerStore = defineStore("surveyer", () => {
  const { status } = useAuth();
  const surveyerConfiguration = ref<SurveyerConfiguration | null>(null);

  const createSurvey = (newSurvey: Survey) => {
    if (!surveyerConfiguration.value) return;

    surveyerConfiguration.value.push(newSurvey);
    save();
  };
  const deleteSurvey = (id: string) => {
    if (!surveyerConfiguration.value) return;

    surveyerConfiguration.value = surveyerConfiguration.value.filter((s) => s.id !== id);
    save();
  };

  const searchQuery = ref("");

  const save = (id?: string) => {
    if (!surveyerConfiguration.value) return;

    if (id) {
      const survey = surveyerConfiguration.value.find((s) => s.id === id);
      if (survey) survey.updatedAt = new Date();
    }

    // @NOTE: Implement saving data from blob when user is authed
    if (status.value === "authenticated") return;

    localStorage.setItem(SURVEYER_STORE, JSON.stringify(surveyerConfiguration.value));
  };

  return {
    surveyerConfiguration,
    createSurvey,
    deleteSurvey,
    searchQuery,
    save,
  };
});
