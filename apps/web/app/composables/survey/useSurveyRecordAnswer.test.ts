import { useSurveyRecordAnswer } from "@/composables/survey/useSurveyRecordAnswer";
import { describe, expect, test } from "vitest";
import { ref } from "vue";

describe(useSurveyRecordAnswer, () => {
  test("reads a record answer as it is", () => {
    expect.hasAssertions();

    const record = { a: "" };
    const answers = useSurveyRecordAnswer(ref(record));

    expect(answers.value).toStrictEqual(record);
  });

  test("reads an absent answer as the empty record", () => {
    expect.hasAssertions();

    const answers = useSurveyRecordAnswer(ref(undefined));

    expect(answers.value).toStrictEqual({});
  });

  test("reads a list answer as the empty record", () => {
    expect.hasAssertions();

    const answers = useSurveyRecordAnswer(ref([]));

    expect(answers.value).toStrictEqual({});
  });
});
