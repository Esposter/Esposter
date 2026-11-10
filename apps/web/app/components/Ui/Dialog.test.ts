// @vitest-environment happy-dom
import UiDialog from "@/components/Ui/Dialog.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiDialogSize } from "@/models/ui/UiDialogSize";
import { UiStyles } from "@/models/ui/UiStyle";
import { UiDialogFrameClassMap } from "@/services/ui/UiDialogFrameClassMap";
import { UiDialogSizeClassMap } from "@/services/ui/UiDialogSizeClassMap";
import { noop } from "@esposter/shared";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiDialog", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    const title = "title";

    test("opens holding focus itself, so no control reads as chosen", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { modelValue: true, title },
        slots: { default: () => h("button", { type: "button" }) },
      });
      await flushPromises();

      expect(document.activeElement).toBe(component.get("dialog").element);
    });

    test("leaves focus to a control that asks for it", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { modelValue: true, title },
        slots: { default: () => h("button", { autofocus: true, type: "button" }) },
      });
      await flushPromises();

      expect(document.activeElement).not.toBe(component.get("dialog").element);
    });

    test("stands over the whole page while an expandable dialog is expanded", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { isExpandable: true, modelValue: true, placement: UiDialogPlacement.Middle, title },
      });
      await flushPromises();
      await component.get('[aria-label="Full screen"]').trigger("click");

      expect(component.emitted("update:isExpanded")).toStrictEqual([[true]]);

      await component.setProps({ isExpanded: true });

      expect(component.get("dialog").attributes("data-placement")).toBe(UiDialogPlacement.FullScreen);
      expect(component.get('[aria-label="Full screen"]').attributes("aria-pressed")).toBe("true");
    });

    // A size is the dialog element's width class, which the browser holds to the viewport. jsdom lays nothing out, so the
    // Class is what is checked
    test("A named size sets the width", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { modelValue: true, placement: UiDialogPlacement.Middle, size: UiDialogSize.Large, title },
      });
      await flushPromises();
      const dialogClasses = component.get("dialog").classes();

      expect(
        Object.values(UiDialogSizeClassMap).filter((sizeClass) => dialogClasses.includes(sizeClass)),
      ).toStrictEqual([UiDialogSizeClassMap[UiDialogSize.Large]]);
    });

    test.each(Object.values(UiDialogSize))("Each named size draws its own width class: %s", async (size) => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { modelValue: true, placement: UiDialogPlacement.Middle, size, title },
      });
      await flushPromises();
      const dialogClasses = component.get("dialog").classes();

      expect(
        Object.values(UiDialogSizeClassMap).filter((sizeClass) => dialogClasses.includes(sizeClass)),
      ).toStrictEqual([UiDialogSizeClassMap[size]]);
    });

    test("A named size sets the width, and no size class when none is given", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { modelValue: true, placement: UiDialogPlacement.Middle, title },
      });
      await flushPromises();
      const dialogClasses = component.get("dialog").classes();

      expect(
        Object.values(UiDialogSizeClassMap).filter((sizeClass) => dialogClasses.includes(sizeClass)),
      ).toStrictEqual([]);
    });

    // A drawer takes its width from its edge and the full screen from the page, so a size given to one leaves it be
    test.each([
      UiDialogPlacement.DrawerBottom,
      UiDialogPlacement.DrawerEnd,
      UiDialogPlacement.DrawerStart,
      UiDialogPlacement.FullScreen,
    ])("A named size leaves a drawer or the full screen to its own width: %s", async (placement) => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { modelValue: true, placement, size: UiDialogSize.Large, title },
      });
      await flushPromises();
      const dialogClasses = component.get("dialog").classes();

      expect(
        Object.values(UiDialogSizeClassMap).filter((sizeClass) => dialogClasses.includes(sizeClass)),
      ).toStrictEqual([]);
    });

    // An editor's close is the title bar's, so the dialog holds open while its caller asks about unsaved changes
    test("stays open when a caller refuses the close its close button asks for", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { modelValue: true, "onUpdate:modelValue": noop, title },
      });
      await flushPromises();
      await component.get('[aria-label="Close"]').trigger("click");

      expect(component.emitted("update:modelValue")).toStrictEqual([[false]]);
      expect(component.get<HTMLDialogElement>("dialog").element.open).toBe(true);
    });

    // An editor with unsaved changes answers a close by asking first, so the dialog holds open until its model moves
    test("stays open when a caller refuses the close Escape asks for", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        // A listener that leaves the model where it is is the caller refusing
        props: { modelValue: true, "onUpdate:modelValue": noop, title },
      });
      await flushPromises();
      const dialog = component.get<HTMLDialogElement>("dialog").element;
      const cancelEvent = new Event("cancel", { cancelable: true });
      dialog.dispatchEvent(cancelEvent);
      await flushPromises();

      expect(cancelEvent.defaultPrevented).toBe(true);
      expect(component.emitted("update:modelValue")).toStrictEqual([[false]]);
      expect(dialog.open).toBe(true);
    });

    // The body is the one region the frame's flex column scrolls, so a list taller than the frame is held inside it.
    // jsdom measures no layout, so the overflow itself is proven in a driven browser; this pins the structure it needs
    test("A long list scrolls inside the body", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { modelValue: true, title },
        slots: { default: () => h("ul", [h("li", "a")]) },
      });
      await flushPromises();
      const body = component.get("[ui-region-body]");

      expect(body.element.parentElement).toBe(component.get("section").element);
      expect(body.element.contains(component.get("ul").element)).toBe(true);
    });

    // A tall frame stands at its placement's height rather than only being capped by it, so a two-pane body has a height
    // To divide and each pane scrolls on its own
    test.each([UiDialogPlacement.High, UiDialogPlacement.Middle])(
      "A tall dialog stands at a definite height: %s",
      async (placement) => {
        expect.hasAssertions();

        const component = mount(UiDialog, {
          attachTo: document.body,
          props: { isTall: true, modelValue: true, placement, title },
        });
        await flushPromises();
        const frameClasses = component.get("section").classes();

        expect(frameClasses).toContain(UiDialogFrameClassMap[placement].tallHeight);
        expect(frameClasses).not.toContain(UiDialogFrameClassMap[placement].height);
      },
    );

    test.each([UiDialogPlacement.High, UiDialogPlacement.Middle])(
      "A dialog that is not tall keeps the cap its placement gives it: %s",
      async (placement) => {
        expect.hasAssertions();

        const component = mount(UiDialog, { attachTo: document.body, props: { modelValue: true, placement, title } });
        await flushPromises();
        const frameClasses = component.get("section").classes();

        expect(frameClasses).toContain(UiDialogFrameClassMap[placement].height);
        expect(frameClasses).not.toContain(UiDialogFrameClassMap[placement].tallHeight);
      },
    );

    // A drawer and the full screen already stand at their edge's height, so a tall one keeps its own class
    test.each([
      UiDialogPlacement.DrawerBottom,
      UiDialogPlacement.DrawerEnd,
      UiDialogPlacement.DrawerStart,
      UiDialogPlacement.FullScreen,
    ])("A tall drawer or the full screen keeps its own height: %s", async (placement) => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { isTall: true, modelValue: true, placement, title },
      });
      await flushPromises();

      expect(component.get("section").classes()).toContain(UiDialogFrameClassMap[placement].tallHeight);
    });

    // A body draws no height of its own, so the frame sizes it to its content and only its maximum limits it. Whether a
    // Short one shows a scrollbar is the layout the browser decides, which the driven browser run proves
    test("A short body does not scroll", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { modelValue: true, title },
        slots: { default: () => h("p", "a") },
      });
      await flushPromises();

      expect(component.get("[ui-region-body]").classes()).toStrictEqual(["p-3"]);
    });

    test("A bare body keeps the scroll without the padding", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { isBodyBare: true, modelValue: true, title },
        slots: { default: () => h("ul", [h("li", "a")]) },
      });
      await flushPromises();

      expect(component.get("[ui-region-body]").classes()).toStrictEqual([]);
    });

    // The footer is drawn after the body rather than inside it, so a long body scrolls above the actions and not over them
    test("The footer stays in view", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { modelValue: true, title },
        slots: { default: () => h("p", "a"), footer: () => h("button", { type: "button" }) },
      });
      await flushPromises();
      const footer = component.get("footer");

      expect(footer.element.parentElement).toBe(component.get("section").element);
      expect(component.get("[ui-region-body]").element.nextElementSibling).toBe(footer.element);
    });

    // The body is there either way, so the footer's absence is what is checked rather than a dialog with no body at all
    test("No footer content draws no region", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { modelValue: true, title },
        slots: { default: () => h("p", "a") },
      });
      await flushPromises();

      expect(component.find("[ui-region-body]").exists()).toBe(true);
      expect(component.find("footer").exists()).toBe(false);
    });

    // The title bar draws the title and a close control beside it, so the reader can name the dialog and dismiss it
    test("A dialog shows its title with a close control", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, { attachTo: document.body, props: { modelValue: true, title } });
      await flushPromises();

      expect(component.get("hgroup").text()).toBe(title);
      expect(component.find('[aria-label="Close"]').exists()).toBe(true);
    });

    // The body is the one region that scrolls, and the title bar and the footer sit outside it, so a long body scrolls
    // Between them and leaves both in view. jsdom lays nothing out, so the scroll itself is proven in a driven browser
    test("A long body scrolls inside the dialog", async () => {
      expect.hasAssertions();

      const component = mount(UiDialog, {
        attachTo: document.body,
        props: { modelValue: true, title },
        slots: { default: () => h("ul", [h("li", "a")]), footer: () => h("button", { type: "button" }) },
      });
      await flushPromises();
      const body = component.get("[ui-region-body]").element;

      expect(body.parentElement).toBe(component.get("section").element);
      expect(body.contains(component.get("header").element)).toBe(false);
      expect(body.contains(component.get("footer").element)).toBe(false);
    });
  });
});
