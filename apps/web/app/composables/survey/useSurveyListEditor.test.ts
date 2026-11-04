// @vitest-environment nuxt
import { useSurveyListEditor } from "@/composables/survey/useSurveyListEditor";
import { describe, expect, test } from "vitest";

const createEditor = (items: { value: string }[]) => {
  const modelValue = ref(items);
  return {
    modelValue,
    ...useSurveyListEditor(modelValue, {
      duplicateMessage: "",
      getItemError: () => undefined,
      getKey: (item) => item.value,
    }),
  };
};

describe(useSurveyListEditor, () => {
  const a = { value: "a" };
  const b = { value: "b" };
  const c = { value: "c" };

  test("after an outside change that adds a row the untouched rows keep their ids", async () => {
    expect.hasAssertions();
    const { modelValue, rows } = createEditor([a, b]);
    const previousRows = rows.value;

    modelValue.value = [a, b, c];
    await nextTick();

    expect(rows.value.slice(0, previousRows.length)).toStrictEqual(previousRows);
    expect(rows.value.map(({ item }) => item)).toStrictEqual([a, b, c]);
  });

  test("after an outside change that removes a row the remaining rows keep theirs", async () => {
    expect.hasAssertions();
    const { modelValue, rows } = createEditor([a, b, c]);
    const previousRows = rows.value;

    modelValue.value = [a, c];
    await nextTick();

    expect(rows.value).toStrictEqual(previousRows.filter(({ item }) => item.value !== b.value));
  });

  test("two identical items match one row each in order, so no row is matched twice", async () => {
    expect.hasAssertions();
    const { modelValue, rows } = createEditor([a, b, a]);
    const previousRows = rows.value;

    modelValue.value = [a, a];
    await nextTick();

    expect(rows.value).toStrictEqual(previousRows.filter(({ item }) => item.value === a.value));
  });
});
