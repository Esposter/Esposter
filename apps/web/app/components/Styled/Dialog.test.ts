// @vitest-environment happy-dom
import StyledDialog from "@/components/Styled/Dialog.vue";
import StyledFormDialog from "@/components/Styled/FormDialog.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { DEFAULT_UI_STYLE } from "@@/configuration/UiStyleMap";
import { noop } from "@esposter/shared";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

const getFooterButtonTexts = () =>
  Array.from(document.body.querySelectorAll("dialog footer button"), ({ textContent }) => textContent.trim());

beforeEach(() => {
  setActivePinia(createPinia());
});

describe("styledDialog", () => {
  setupUiStyle(DEFAULT_UI_STYLE);

  const confirmLabel = "confirmLabel";
  const title = "title";
  const body = "<p>a</p>";
  const prependConfirm = "<button>a</button>";
  const mountDialog = async (
    props: Partial<InstanceType<typeof StyledDialog>["$props"]>,
    slots?: Record<string, string>,
    modelValue = true,
  ) => {
    const component = mount(StyledDialog, { attachTo: document.body, props: { modelValue, title, ...props }, slots });
    await flushPromises();
    return component;
  };

  // Every dialog is meant to reach for this shell, so what these pin are the shapes whose absence forces a consumer to
  // Re-roll it: a dialog with nothing to confirm, and a third decision beside the other two
  test("renders no actions row when there is nothing to confirm", async () => {
    expect.hasAssertions();

    await mountDialog({}, { default: body });

    expect(document.body.querySelector("dialog footer")).toBeNull();
  });

  test("renders the actions row when there is something to confirm", async () => {
    expect.hasAssertions();

    await mountDialog({ confirmLabel }, { default: body });

    expect(getFooterButtonTexts()).toStrictEqual(["Cancel", confirmLabel]);
  });

  // A third decision is a button among the other two, so it belongs in the trailing group rather than pushed to
  // The opposite edge with the annotations — which is where it lands if it is passed as `prepend-actions`
  test("renders a third decision between cancel and confirm", async () => {
    expect.hasAssertions();

    await mountDialog({ confirmLabel }, { "prepend-confirm": prependConfirm });

    expect(getFooterButtonTexts()).toStrictEqual(["Cancel", "a", confirmLabel]);
  });

  // The row exists when the row has content, not only when there is a confirm button: a dialog whose only answers
  // Are cancel and an alternative still needs somewhere to put them
  test("renders the actions row for an action slot with nothing to confirm", async () => {
    expect.hasAssertions();

    await mountDialog({}, { "prepend-confirm": prependConfirm });

    expect(getFooterButtonTexts()).toStrictEqual(["Cancel", "a"]);
  });

  // The library's dialog is in the document whether or not it is open, so the shell is what keeps a closed one's body
  // — a viewer, a query, a form's state — from existing
  test("mounts its body only while open", async () => {
    expect.hasAssertions();

    const component = await mountDialog({}, { default: body }, false);

    expect(document.body.querySelector("dialog p")).toBeNull();

    await component.setProps({ modelValue: true });

    expect(document.body.querySelector("dialog p")?.textContent).toBe("a");
  });

  test("closes once the confirm settles", async () => {
    expect.hasAssertions();

    const component = await mountDialog({ confirm: noop, confirmLabel });
    await component.get("footer button:last-child").trigger("click");
    await flushPromises();

    expect(component.emitted("update:modelValue")).toStrictEqual([[false]]);
  });
});

describe("styledFormDialog", () => {
  setupUiStyle(DEFAULT_UI_STYLE);

  const confirmLabel = "confirmLabel";
  const title = "title";

  // The confirm is the form's submit, so it goes through the form's own validation, and a failed write keeps the
  // Dialog open over the draft
  test("submits through its form and stays open when the submit fails", async () => {
    expect.hasAssertions();

    const submit = vi.fn<() => boolean>(() => false);
    const component = mount(StyledFormDialog, {
      attachTo: document.body,
      props: { confirmLabel, modelValue: true, submit, title },
      slots: { default: "<p>a</p>" },
    });
    await flushPromises();
    const confirmButton = component.get<HTMLButtonElement>("footer button:last-child");

    expect(confirmButton.attributes("type")).toBe("submit");

    await component.get("form").trigger("submit");
    await flushPromises();

    expect(submit).toHaveBeenCalledTimes(1);
    expect(component.emitted("update:modelValue")).toBeUndefined();
  });
});
