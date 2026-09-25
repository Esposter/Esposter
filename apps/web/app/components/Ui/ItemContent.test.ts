// @vitest-environment happy-dom
import UiItemContent from "@/components/Ui/ItemContent.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiItemContent", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const description = "description";
    const title = "title";

    test.each([UiIconMeaning.Search, undefined])(
      "keeps its mark's column hidden from assistive technology with the mark %s",
      (meaning) => {
        expect.hasAssertions();

        const component = mount(
          defineComponent(() => () => h("div", h(UiItemContent, { description, meaning, title }))),
        );

        expect(component.text()).toBe(`${title} ${description}`);
        expect(component.element.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
      },
    );

    test("draws a mark no prop names in the same hidden column", () => {
      expect.hasAssertions();

      const component = mount(
        defineComponent(
          () => () => h("div", h(UiItemContent, { title }, { mark: () => h("svg", { "data-mark": "" }) })),
        ),
      );
      const markColumn = component.element.firstElementChild;

      expect(markColumn?.getAttribute("aria-hidden")).toBe("true");
      expect(markColumn?.querySelector("[data-mark]")).not.toBeNull();
    });
  });
});
