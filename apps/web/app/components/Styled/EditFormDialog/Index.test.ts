// @vitest-environment happy-dom
import StyledEditFormDialog from "@/components/Styled/EditFormDialog/Index.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { DIALOG_CLOSE_DURATION_MS } from "@/services/ui/constants";
import { DEFAULT_UI_STYLE } from "@@/configuration/constants";
import { noop } from "@esposter/shared";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { z } from "zod";

beforeEach(() => {
  setActivePinia(createPinia());
});

describe("styledEditFormDialog", () => {
  setupUiStyle(DEFAULT_UI_STYLE);

  const name = "name";
  // Raw, as a prop hands it over: the mount would otherwise proxy it deeply, which a schema does not survive
  const schema = markRaw(z.object({ name: z.string() }));
  const mountDialog = (isDirty: boolean) =>
    mount(StyledEditFormDialog, {
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

  // The close waits out the dialog's leave on a timer, and Vue's own scheduler and `flushPromises` run on the others
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

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

    const component = mountDialog(isDirty);
    await flushPromises();
    await component.get('[aria-label="Close"]').trigger("click");
    await flushPromises();
    const openDialogs = component.findAll<HTMLDialogElement>("dialog").filter(({ element }) => element.open);

    expect(component.emitted("update:modelValue")).toStrictEqual(updates);
    expect(openDialogs).toHaveLength(openDialogCount);
  });

  // A close resets the item once the dialog has left, so a reopen inside the leave would otherwise lose it
  test("a reopen inside the close keeps the item", async () => {
    expect.hasAssertions();

    const component = mountDialog(false);
    await flushPromises();
    await component.setProps({ modelValue: false });
    await component.setProps({ modelValue: true });
    vi.advanceTimersByTime(DIALOG_CLOSE_DURATION_MS);

    expect(component.emitted("close")).toBeUndefined();
  });
});
