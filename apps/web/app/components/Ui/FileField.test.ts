// @vitest-environment happy-dom
import { MimeType } from "#shared/models/file/MimeType";
import UiFileField from "@/components/Ui/FileField.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { getFileSize } from "@/services/file/getFileSize";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

const createDropEvent = (files: File[]) => {
  const event = new Event("drop", { bubbles: true, cancelable: true });
  Object.defineProperty(event, "dataTransfer", {
    value: { files, items: files.map(({ type }) => ({ kind: "file", type })) },
  });
  return event;
};

describe("uiFileField", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const label = "label";
    const accept = "image/*";
    const image = new File([""], "a", { type: MimeType.Png });
    const text = new File([""], "b", { type: MimeType.PlainText });
    const mountFileField = (isMultiple?: true) => {
      const component = mount(UiFileField, {
        attachTo: document.body,
        props: {
          accept,
          isMultiple,
          label,
          modelValue: [],
          "onUpdate:modelValue": (modelValue: File[]) => component.setProps({ modelValue }),
        },
      });
      return component;
    };

    test("is a button named by its visible label that opens the picker for what it accepts", async () => {
      expect.hasAssertions();

      const component = mountFileField();
      const button = component.get("button");
      const input = component.get<HTMLInputElement>('input[type="file"]');
      const click = vi.spyOn(input.element, "click");
      await button.trigger("click");

      expect(button.attributes("type")).toBe("button");
      expect(component.get(`#${button.attributes("aria-labelledby")}`).text()).toBe(label);
      expect(input.attributes("accept")).toBe(accept);
      expect(input.attributes("multiple")).toBeUndefined();
      expect(click).toHaveBeenCalledExactlyOnceWith();

      component.unmount();
    });

    test("takes what the picker chose, describes it by name and size, and clears it", async () => {
      expect.hasAssertions();

      const component = mountFileField(true);
      const input = component.get<HTMLInputElement>('input[type="file"]');
      Object.defineProperty(input.element, "files", { value: [image, text] });
      await input.trigger("change");

      expect(input.attributes("multiple")).toBe("");
      expect(component.props("modelValue")).toStrictEqual([image]);
      expect(component.get(`#${component.get("button").attributes("aria-describedby")}`).text()).toBe(
        `${image.name} ${getFileSize(image.size)}`,
      );

      await component.get(`[aria-label="Clear ${label}"]`).trigger("click");

      expect(component.props("modelValue")).toStrictEqual([]);
      expect(component.find(`[aria-label="Clear ${label}"]`).exists()).toBe(false);

      component.unmount();
    });

    test("takes what is dropped onto it that it accepts", async () => {
      expect.hasAssertions();

      const component = mountFileField(true);
      await flushPromises();
      component.get("button").element.dispatchEvent(createDropEvent([text, image]));
      await flushPromises();

      expect(component.props("modelValue")).toStrictEqual([image]);

      component.unmount();
    });
  });
});
