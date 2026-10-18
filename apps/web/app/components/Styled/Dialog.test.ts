// @vitest-environment happy-dom
import StyledDialog from "@/components/Styled/Dialog.vue";
import StyledFormDialog from "@/components/Styled/FormDialog.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { DEFAULT_UI_STYLE } from "@@/configuration/constants";
import { noop } from "@esposter/shared";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test, vi } from "vitest";

// The actions row's buttons in order, or nothing when there is no row at all
const getFooterButtonTexts = () => {
  const footer = document.body.querySelector("dialog footer");
  return footer ? Array.from(footer.querySelectorAll("button"), ({ textContent }) => textContent.trim()) : undefined;
};

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
  // Re-roll it: a dialog with nothing to confirm, and a third decision beside the other two. A third decision is a
  // Button among the other two, so it belongs in the trailing group rather than at the opposite edge with the
  // Annotations, where `prepend-actions` puts it. The row exists when it has content, not only when there is a confirm
  // Button: a dialog whose only answers are cancel and an alternative still needs somewhere to put them
  test.each([
    {
      description: "renders no actions row when there is nothing to confirm",
      expected: undefined,
      props: {},
      slots: { default: body },
    },
    {
      description: "renders the actions row when there is something to confirm",
      expected: ["Cancel", confirmLabel],
      props: { confirmLabel },
      slots: { default: body },
    },
    {
      description: "renders a third decision between cancel and confirm",
      expected: ["Cancel", "a", confirmLabel],
      props: { confirmLabel },
      slots: { "prepend-confirm": prependConfirm },
    },
    {
      description: "renders the actions row for an action slot with nothing to confirm",
      expected: ["Cancel", "a"],
      props: {},
      slots: { "prepend-confirm": prependConfirm },
    },
    {
      description: "renders the actions row for an action slot under an empty confirm label",
      expected: ["Cancel", "a"],
      props: { confirmLabel: "" },
      slots: { "prepend-confirm": prependConfirm },
    },
  ])("$description", async ({ expected, props, slots }) => {
    expect.hasAssertions();

    await mountDialog(props, slots);

    expect(getFooterButtonTexts()).toStrictEqual(expected);
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
