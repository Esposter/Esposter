// @vitest-environment nuxt
import ResourceSurveyFieldImage from "@/components/Resource/Survey/Field/Image.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { surveyImageNodePropsSchema, SurveyNodeType } from "headless-survey-engine";
import { describe, expect, test } from "vitest";

describe("resourceSurveyFieldImage", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const imageLink = "/image";

    test("draws its picture with its alternative text", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldImage, {
        props: {
          error: "",
          isDisabled: false,
          node: {
            props: {
              ...surveyImageNodePropsSchema.parse({ altText: "a", imageLink, name: "a" }),
              id: crypto.randomUUID(),
            },
            type: SurveyNodeType.Image,
          },
        },
      });
      const image = component.get("img");

      expect(image.attributes("src")).toBe(imageLink);
      expect(image.attributes("alt")).toBe("a");
    });

    test("is decorative, with an empty alternative text, when it has none", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldImage, {
        props: {
          error: "",
          isDisabled: false,
          node: {
            props: {
              ...surveyImageNodePropsSchema.parse({ altText: "", imageLink, name: "a" }),
              id: crypto.randomUUID(),
            },
            type: SurveyNodeType.Image,
          },
        },
      });

      expect(component.get("img").attributes("alt")).toBe("");
    });
  });
});
