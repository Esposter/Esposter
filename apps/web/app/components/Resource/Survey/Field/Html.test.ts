// @vitest-environment happy-dom
import ResourceSurveyFieldHtml from "@/components/Resource/Survey/Field/Html.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { surveyHtmlNodePropsSchema, SurveyNodeType } from "survey-engine";
import { describe, expect, test } from "vitest";

describe("resourceSurveyFieldHtml", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test("renders its markup with the script elements in it removed", () => {
      expect.hasAssertions();

      const component = mount(ResourceSurveyFieldHtml, {
        props: {
          error: "",
          isDisabled: false,
          node: {
            props: {
              ...surveyHtmlNodePropsSchema.parse({ html: "<p>a</p><script></script>", name: "a" }),
              id: crypto.randomUUID(),
            },
            type: SurveyNodeType.Html,
          },
        },
      });

      expect(component.find("script").exists()).toBe(false);
      expect(component.get("p").text()).toBe("a");
    });
  });
});
