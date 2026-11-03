import type { InjectionKey } from "vue";

// The seed a session's shuffled choices are ordered by, so a respondent sees the same order on every render
export const surveyChoiceSeedKey: InjectionKey<string> = Symbol("surveyChoiceSeed");

export const provideSurveyChoiceSeed = (seed: string) => {
  provide(surveyChoiceSeedKey, seed);
};

// Where no session provides one, the empty seed still orders a shuffle the same way on every render
export const useSurveyChoiceSeed = () => inject(surveyChoiceSeedKey, "");
