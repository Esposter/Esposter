// @vitest-environment happy-dom
import StyledEditFormDialog from "@/components/Styled/EditFormDialog/Index.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { DEFAULT_UI_STYLE } from "@@/configuration/constants";
import { noop } from "@esposter/shared";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";
import { z } from "zod";

beforeEach(() => {
  setActivePinia(createPinia());
});

describe("styledEditFormDialog", () => {
  setupUiStyle(DEFAULT_UI_STYLE);

  const name = "name";
  // Raw, as a prop hands it over: the mount would otherwise proxy it deeply, which a schema does not survive
  const schema = markRaw(z.object({ name: z.string() }));

  // The editor's close is the library title bar's, so the editor is what answers it
  test.each([
    {
      description: "asks first while there are unsaved changes",
      isDirty: true,
      openDialogCount: 2,
      updates: undefined,
    },
    { description: "closes when there is nothing to lose", isDirty: false, openDialogCount: 0, updates: [[false]] },
  ])("$description", async ({ isDirty, openDialogCount, updates }) => {
    expect.hasAssertions();

    const component = mount(StyledEditFormDialog, {
      attachTo: document.body,
      props: {
        editedItem: { name },
        isDirty,
        isEditFormValid: true,
        isSavable: isDirty,
        itemType: name,
        modelValue: true,
        name,
        save: noop,
        schema,
        title: name,
      },
    });
    await flushPromises();
    await component.get('[aria-label="Close"]').trigger("click");
    await flushPromises();
    const openDialogs = component.findAll<HTMLDialogElement>("dialog").filter(({ element }) => element.open);

    expect(component.emitted("update:modelValue")).toStrictEqual(updates);
    expect(openDialogs).toHaveLength(openDialogCount);
  });
});
