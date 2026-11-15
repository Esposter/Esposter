// @vitest-environment happy-dom
import ResourceSurveyFieldHtml from "#src/components/Resource/Survey/Field/Html.vue";
import { setupUiStyle } from "#src/components/Ui/setupUiStyle.test";
import { UiStyles } from "#src/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { v7 } from "uuid";
import { describe, expect, test } from "vitest";
import { surveyHtmlNodePropsSchema, SurveyNodeType } from "vue-survey-engine-headless";

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
            props: { ...surveyHtmlNodePropsSchema.parse({ html: "<p>a</p><script></script>", name: "a" }), id: v7() },
            type: SurveyNodeType.Html,
          },
        },
      });

      expect(component.find("script").exists()).toBe(false);
      expect(component.get("p").text()).toBe("a");
    });
  });
});
