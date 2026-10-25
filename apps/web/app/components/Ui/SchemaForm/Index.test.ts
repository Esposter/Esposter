// @vitest-environment nuxt
import { createResourceLinkSchema } from "#shared/services/resource/link/createResourceLinkSchema";
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceLinkSelect from "@/components/Resource/Link/Select.vue";
import UiSchemaForm from "@/components/Ui/SchemaForm/Index.vue";
import UiSchemaFormText from "@/components/Ui/SchemaForm/Text.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { UiStyles } from "@/models/ui/UiStyle";
import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { setupMswTrpc } from "@/services/trpc/mswTrpc.test";
import { ResourceLinkType, ResourceType } from "@esposter/db-schema";
import { noop, takeOne } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

describe("uiSchemaForm", () => {
  const { trpcMsw } = setupMswTrpc();

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const message = "message";
    const validationSchema = z.object({ name: z.string().refine((name) => name !== " ", message) });
    const schema = zodToJsonSchema(validationSchema);
    const arraySchema = zodToJsonSchema(z.object({ items: z.array(z.object({ name: z.string() })) }));
    const linkSchema = zodToJsonSchema(
      z.object({ name: z.string(), surveyId: createResourceLinkSchema(ResourceLinkType.Survey) }),
    );

    test("draws a resource link as the shared select of the owner's resources of its type, beside a plain field as text", async () => {
      expect.hasAssertions();

      const survey = createResourceListItem({ type: ResourceType.Survey });
      trpcMsw.survey.readResources.query(() => ({ hasMore: false, items: [{ ...survey, publication: null }] }));
      const component = await mountSuspended(UiSchemaForm, {
        props: { modelValue: { name: "", surveyId: survey.id }, schema: linkSchema },
      });
      await flushPromises();

      expect(component.findAllComponents(UiSchemaFormText)).toHaveLength(1);
      expect(component.findComponent(ResourceLinkSelect).props("resources")).toStrictEqual({
        hasMore: false,
        items: [{ meaning: UiIconMeaning.Survey, title: survey.name, value: survey.id }],
      });
    });

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

    test("#2025 and PR 2623: renders its fields without Vue proxying the renderer components", async () => {
      expect.hasAssertions();

      const warn = vi.spyOn(console, "warn").mockImplementation(noop);
      await mountSuspended(UiSchemaForm, { props: { modelValue: { name: "" }, schema, validationSchema } });
      await flushPromises();

      // Only the proxy warning: Nuxt's mount always hands Vue Test Utils its mocks, which it applies as a mixin that an
      // Options API free Vue warns about on every mount
      expect(warn.mock.calls.filter(([warning]) => String(warning).includes("made a reactive object"))).toStrictEqual(
        [],
      );
    });

    test("draws the ranked fields of a schema with a node nothing draws, and no notice for that node", async () => {
      expect.hasAssertions();

      const noRendererNotice = "No applicable renderer found.";
      const nothingSchema = zodToJsonSchema(z.object({ name: z.string(), nothing: z.null() }));
      const component = await mountSuspended(UiSchemaForm, {
        props: { modelValue: { name: "", nothing: null }, schema: nothingSchema },
      });
      await flushPromises();

      expect(component.findAll("input")).toHaveLength(1);
      expect(component.text()).toContain("Name");
      expect(component.text()).not.toContain(noRendererNotice);
    });

    test("#2003: editing a field nested in a list changes the form's value once, at its own path", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiSchemaForm, {
        props: { modelValue: { items: [{ name: "" }, { name: "" }] }, schema: arraySchema },
      });
      await flushPromises();
      const secondItemInput = takeOne(component.findAll("input"), 1);
      await secondItemInput.setValue("a");
      await flushPromises();

      expect(component.emitted("update:modelValue")).toStrictEqual([[{ items: [{ name: "" }, { name: "a" }] }]]);
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

    test("draws a nested object as a group of its fields, and writes at its nested path", async () => {
      expect.hasAssertions();

      const nestedSchema = z.object({ nested: z.object({ name: z.string() }) });
      const component = await mountSuspended(UiSchemaForm, {
        props: { modelValue: { nested: { name: "" } }, schema: zodToJsonSchema(nestedSchema) },
      });
      await flushPromises();
      await component.get("input").setValue("a");
      await flushPromises();

      const group = component.get('[role="group"]');

      expect(component.get(`#${group.attributes("aria-labelledby")}`).text()).toBe("Nested");
      expect(component.emitted("update:modelValue")?.at(-1)).toStrictEqual([{ nested: { name: "a" } }]);
    });

    test("adds an array item at the end", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiSchemaForm, {
        props: { modelValue: { items: [] }, schema: arraySchema },
      });
      await flushPromises();
      await component.get('button[aria-label="Add Items"]').trigger("click");
      await flushPromises();

      expect(component.emitted("update:modelValue")?.at(-1)).toStrictEqual([{ items: [{}] }]);
    });

    test("moves an array item down", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiSchemaForm, {
        props: { modelValue: { items: [{ name: "" }, { name: " " }] }, schema: arraySchema },
      });
      await flushPromises();
      await component.get('button[aria-label="Move Items 1 down"]').trigger("click");
      await flushPromises();

      expect(component.emitted("update:modelValue")?.at(-1)).toStrictEqual([{ items: [{ name: " " }, { name: "" }] }]);
    });

    test("removes an array item", async () => {
      expect.hasAssertions();

      const component = await mountSuspended(UiSchemaForm, {
        props: { modelValue: { items: [{ name: "" }] }, schema: arraySchema },
      });
      await flushPromises();
      await component.get('button[aria-label="Remove Items 1"]').trigger("click");
      await flushPromises();

      expect(component.emitted("update:modelValue")?.at(-1)).toStrictEqual([{ items: [] }]);
    });
  });
});
