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

    test.each([UiIconMeaning.Search, undefined])(
      "keeps its mark's column hidden from assistive technology with the mark %s",
      (meaning) => {
        expect.hasAssertions();

        const description = "description";
        const title = "title";
        const component = mount(
          defineComponent(() => () => h("div", h(UiItemContent, { description, meaning, title }))),
        );

        expect(component.text()).toBe(`${title} ${description}`);
        expect(component.element.firstElementChild?.getAttribute("aria-hidden")).toBe("true");
      },
    );
  });
});
