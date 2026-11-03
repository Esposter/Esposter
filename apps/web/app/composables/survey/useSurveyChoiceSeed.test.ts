// @vitest-environment happy-dom
import { provideSurveyChoiceSeed, useSurveyChoiceSeed } from "@/composables/survey/useSurveyChoiceSeed";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe(useSurveyChoiceSeed, () => {
  const Reader = defineComponent({ render: () => h("i"), setup: () => ({ seed: useSurveyChoiceSeed() }) });
  const createProvider = (seed: string) =>
    defineComponent({
      render: () => h(Reader),
      setup: () => {
        provideSurveyChoiceSeed(seed);
      },
    });

  test("reads the seed its nearest provider gives", () => {
    expect.hasAssertions();

    const seed = crypto.randomUUID();
    const component = mount(createProvider(seed));

    expect(component.findComponent(Reader).vm.seed).toBe(seed);
  });

  test("reads an empty seed where no provider gives one", () => {
    expect.hasAssertions();

    const component = mount(Reader);

    expect(component.vm.seed).toBe("");
  });
});
