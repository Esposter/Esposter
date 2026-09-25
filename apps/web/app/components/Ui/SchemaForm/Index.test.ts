// @vitest-environment nuxt
import UiSchemaForm from "@/components/Ui/SchemaForm/Index.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import { z } from "zod";

describe("uiSchemaForm", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const message = "message";
    const validationSchema = z.object({ name: z.string().refine((name) => name !== " ", message) });
    const schema = zodToJsonSchema(validationSchema);

    test("draws a string as the library's text field named by its title, and writes what is typed", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiSchemaForm, {
        props: { modelValue: { name: "" }, schema, validationSchema },
      });
      await flushPromises();
      const input = component.get("input");
      await input.setValue("a");
      await flushPromises();

      expect(component.text()).toContain("Name");
      expect(component.emitted("update:modelValue")?.at(-1)).toStrictEqual([{ name: "a" }]);
    });

    test("renders its fields without Vue proxying the renderer components", async () => {
      expect.hasAssertions();

      const warn = vi.spyOn(console, "warn").mockImplementation(noop);
      await mountSuspended(UiSchemaForm, { props: { modelValue: { name: "" }, schema, validationSchema } });
      await flushPromises();

      expect(warn).not.toHaveBeenCalled();
    });

    test("shows the Zod schema's issue on the field at its path once the field is changed", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiSchemaForm, {
        props: {
          modelValue: { name: "" },
          "onUpdate:modelValue": (modelValue: unknown) => component.setProps({ modelValue }),
          schema,
          validationSchema,
        },
      });
      await flushPromises();

      expect(component.text()).not.toContain(message);

      await component.get("input").setValue(" ");
      await flushPromises();

      expect(component.get('[role="alert"]').text()).toBe(message);
      expect(component.get("input").attributes("aria-invalid")).toBe("true");
    });
  });
});
