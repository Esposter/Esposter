import { useSurveyTheme } from "@/composables/survey/useSurveyTheme";
import { surveyRootPropsSchema } from "vue-survey-engine-headless";
import { describe, expect, test } from "vitest";

describe(useSurveyTheme, () => {
  test("a survey that sets no colour sets no style variable, so the design style's own tokens apply", () => {
    expect.hasAssertions();

    const theme = useSurveyTheme(surveyRootPropsSchema.parse({}));

    expect(theme.value).toStrictEqual({});
  });

  test("a colour the survey sets is the library's token for it, and a colour it leaves unset sets no variable", () => {
    expect.hasAssertions();

    const accentColor = "#00ff00";
    const theme = useSurveyTheme(surveyRootPropsSchema.parse({ accentColor }));

    expect(theme.value).toStrictEqual({ "--ui-accent": accentColor });
  });
});
