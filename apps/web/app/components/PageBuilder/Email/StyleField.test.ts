// @vitest-environment nuxt
import type { EmailStyleField } from "@/models/pageBuilder/EmailStyleField";

import UiColorField from "@/components/Ui/ColorField.vue";
import UiSelect from "@/components/Ui/Select/Index.vue";
import UiSwitch from "@/components/Ui/Switch.vue";
import PageBuilderEmailStyleField from "@/components/PageBuilder/Email/StyleField.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { MjmlAttributeKind } from "mjml-blocks";
import { describe, expect, test } from "vitest";

describe("pageBuilderEmailStyleField", () => {
  const FIELD_NAME = "align";
  const ENUM_OPTION = "left";
  const ENUM_OTHER_OPTION = "right";
  const COLOR_VALUE = "#ffffff";
  const BOOLEAN_NAME = "full-width";
  const createField = (type: EmailStyleField["type"], overrides: Partial<EmailStyleField> = {}): EmailStyleField => ({
    isSet: false,
    name: FIELD_NAME,
    placeholder: "",
    type,
    value: "",
    ...overrides,
  });

  test("an enum field is drawn as a select of its options", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(PageBuilderEmailStyleField, {
      props: { field: createField({ kind: MjmlAttributeKind.Enum, options: [ENUM_OPTION, ENUM_OTHER_OPTION] }) },
    });

    expect(component.findComponent(UiSelect).props("items")).toStrictEqual([
      { title: ENUM_OPTION, value: ENUM_OPTION },
      { title: ENUM_OTHER_OPTION, value: ENUM_OTHER_OPTION },
    ]);
  });

  test("a colour field is drawn as a colour control whose pick is written as its value", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(PageBuilderEmailStyleField, {
      props: { field: createField({ kind: MjmlAttributeKind.Color }) },
    });
    component.findComponent(UiColorField).vm.$emit("update:modelValue", COLOR_VALUE);

    expect(component.emitted("update")).toStrictEqual([[COLOR_VALUE]]);
  });

  test("a boolean field is drawn as a switch whose value is written as the MJML string", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(PageBuilderEmailStyleField, {
      props: { field: createField({ kind: MjmlAttributeKind.Boolean }, { name: BOOLEAN_NAME, placeholder: "false" }) },
    });
    component.findComponent(UiSwitch).vm.$emit("update:modelValue", true);

    expect(component.findComponent(UiSwitch).props("modelValue")).toBe(false);
    expect(component.emitted("update")).toStrictEqual([["true"]]);
  });

  test("reset is offered only once the node sets the field", async () => {
    expect.hasAssertions();

    const unsetComponent = await mountSuspended(PageBuilderEmailStyleField, {
      props: { field: createField({ kind: MjmlAttributeKind.String }) },
    });
    const setComponent = await mountSuspended(PageBuilderEmailStyleField, {
      props: { field: createField({ kind: MjmlAttributeKind.String }, { isSet: true, value: ENUM_OPTION }) },
    });
    await setComponent.get(`[aria-label="Reset ${FIELD_NAME}"]`).trigger("click");

    expect(unsetComponent.find(`[aria-label="Reset ${FIELD_NAME}"]`).exists()).toBe(false);
    expect(setComponent.emitted("reset")).toStrictEqual([[]]);
  });
});
