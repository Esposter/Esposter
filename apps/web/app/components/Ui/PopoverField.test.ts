// @vitest-environment nuxt
import UiPopoverField from "@/components/Ui/PopoverField.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("uiPopoverField", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const callerLabelledBy = crypto.randomUUID();
    const label = "label";
    const placeholder = "placeholder";
    const value = "value";

    test("reads its placeholder while it is empty, and its value once it holds one", async () => {
      expect.hasAssertions();

      const emptyComponent = await mountSuspended(UiPopoverField, {
        props: { isClearable: false, isEmpty: true, label, placeholder },
      });
      const filledComponent = await mountSuspended(UiPopoverField, {
        props: { isClearable: false, isEmpty: false, label, placeholder },
        slots: { value: () => value },
      });

      const emptyValueId = emptyComponent.get("button[aria-describedby]").attributes("aria-describedby");
      const filledValueId = filledComponent.get("button[aria-describedby]").attributes("aria-describedby");

      expect(emptyComponent.get(`[id="${emptyValueId}"]`).text()).toBe(placeholder);
      expect(filledComponent.get(`[id="${filledValueId}"]`).text()).toBe(value);
    });

    test("names a required trigger by its label and the required word", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiPopoverField, {
        props: { isClearable: false, isEmpty: true, isRequired: true, label, placeholder },
      });
      const labelledBy = component.get("button").attributes("aria-labelledby");

      expect(component.get(`[id="${labelledBy}"]`).text()).toBe(`${label} * required`);
    });

    test("keeps a caller's aria-labelledby on its trigger while the field is not required", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiPopoverField, {
        attrs: { "aria-labelledby": callerLabelledBy },
        props: { isClearable: false, isEmpty: true, label, placeholder },
      });

      expect(component.get("button").attributes("aria-labelledby")).toBe(callerLabelledBy);
    });

    test("joins a caller's aria-labelledby with the required label, the caller's first, while the field is required", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiPopoverField, {
        attrs: { "aria-labelledby": callerLabelledBy },
        props: { isClearable: false, isEmpty: true, isRequired: true, label, placeholder },
      });
      const requiredLabelId = component.get("span[id]").attributes("id");

      expect(component.get("button").attributes("aria-labelledby")).toBe(`${callerLabelledBy} ${requiredLabelId}`);
    });

    test("passes what a call site sets, such as an invalid mark, on its trigger", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiPopoverField, {
        attrs: { "aria-invalid": "true" },
        props: { isClearable: false, isEmpty: true, label, placeholder },
      });

      expect(component.get("button").attributes("aria-invalid")).toBe("true");
    });

    test("offers a clear button that emits clear only while the field is clearable", async () => {
      expect.hasAssertions();

      const clearableComponent = await mountSuspended(UiPopoverField, {
        props: { isClearable: true, isEmpty: false, label, placeholder },
      });
      const unclearableComponent = await mountSuspended(UiPopoverField, {
        props: { isClearable: false, isEmpty: false, label, placeholder },
      });
      await clearableComponent.get(`button[aria-label="Clear ${label}"]`).trigger("click");

      expect(clearableComponent.emitted("clear")).toHaveLength(1);
      expect(unclearableComponent.find(`button[aria-label="Clear ${label}"]`).exists()).toBe(false);
    });
  });
});
