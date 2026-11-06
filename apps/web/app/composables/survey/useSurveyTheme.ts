import type { SurveyRootProps } from "vue-survey-engine-headless";

// The survey's own colours as the library's accent and background tokens, set on the element a survey draws in so every
// Control under it draws in them. A colour the survey leaves unset sets no variable, so the style's own tokens apply
export const useSurveyTheme = (rootProps: MaybeRefOrGetter<SurveyRootProps>) =>
  computed(() => {
    const { accentColor, backgroundColor } = toValue(rootProps);
    return {
      ...(accentColor ? { "--ui-accent": accentColor } : {}),
      ...(backgroundColor ? { "--ui-background": backgroundColor } : {}),
    };
  });
