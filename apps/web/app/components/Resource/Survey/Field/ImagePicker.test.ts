// @vitest-environment nuxt
import type { SurveyAnswerValue, SurveyImagePickerNode } from "vue-survey-engine-headless";

import ResourceSurveyFieldImagePicker from "@/components/Resource/Survey/Field/ImagePicker.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";
import { surveyImagePickerNodePropsSchema, SurveyNodeType } from "vue-survey-engine-headless";

describe("resourceSurveyFieldImagePicker", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const error = "error";
    const id = crypto.randomUUID();
    const imageLink = "/image";
    const title = "title";
    const choices = [
      { imageLink, value: 0 },
      { imageLink, value: 0.1 },
    ];
    const createNode = (multiSelect: boolean): SurveyImagePickerNode => ({
      props: { ...surveyImagePickerNodePropsSchema.parse({ choices, multiSelect, name: "a", title }), id },
      type: SurveyNodeType.ImagePicker,
    });

    test("is a list named by the question's title", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldImagePicker, {
        props: { error: "", isDisabled: false, node: createNode(false) },
      });

      expect(component.get('[role="listbox"]').attributes("aria-label")).toBe(title);
    });

    test("draws a picture its author sized at those pixels", async () => {
      expect.hasAssertions();

      const node = createNode(false);
      const component = await mountSuspended(ResourceSurveyFieldImagePicker, {
        props: {
          error: "",
          isDisabled: false,
          node: { ...node, props: { ...node.props, imageHeight: 80, imageWidth: 120 } },
        },
      });
      const picture = component.get("img").element;

      expect({ height: picture.style.height, width: picture.style.width }).toStrictEqual({
        height: "80px",
        width: "120px",
      });
    });

    test("draws a picture left unsized in the default mark box, with no size of its own", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldImagePicker, {
        props: { error: "", isDisabled: false, node: createNode(false) },
      });
      const picture = component.get("img").element;

      expect({ height: picture.style.height, width: picture.style.width }).toStrictEqual({ height: "", width: "" });
      expect(picture.classList.contains("size-6")).toBe(true);
    });

    test("picks a picture by keyboard, which becomes the answer", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldImagePicker, {
        attachTo: document.body,
        props: { error: "", isDisabled: false, node: createNode(false) },
      });
      const [, second] = component.findAll('[role="option"]');
      await second?.trigger("keydown", { key: " " });

      expect(component.emitted<[SurveyAnswerValue]>("update:modelValue")?.map(([answer]) => answer)).toStrictEqual([
        0.1,
      ]);

      component.unmount();
    });

    test("answers a list of the pictures picked when several may be picked", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldImagePicker, {
        props: { error: "", isDisabled: false, node: createNode(true) },
      });
      const [first, second] = component.findAll('[role="option"]');
      await first?.trigger("click");
      await second?.trigger("click");

      expect(component.emitted<[SurveyAnswerValue[]]>("update:modelValue")?.map(([answer]) => answer)).toStrictEqual([
        [0],
        [0, 0.1],
      ]);
    });

    test("shows its error beside the list and marks the list invalid", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(ResourceSurveyFieldImagePicker, {
        props: { error, isDisabled: false, node: createNode(false) },
      });

      expect(component.get('[role="alert"]').text()).toBe(error);
      expect(component.get('[role="listbox"]').attributes("aria-invalid")).toBe("true");
    });
  });
});
