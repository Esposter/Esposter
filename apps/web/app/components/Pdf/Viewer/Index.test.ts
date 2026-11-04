// @vitest-environment nuxt
import PdfViewer from "@/components/Pdf/Viewer/Index.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import UiSpinner from "@/components/Ui/Spinner.vue";
import { UiStyles } from "@/models/ui/UiStyle";
import { loadPdfViewer } from "@/services/pdf/loadPdfViewer";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { usePdfViewer } from "vue-pdfjs-headless";

// The viewer's module never loads here unless a test rejects it, so each test sees the dialog at the state its props give
vi.mock(import("@/services/pdf/loadPdfViewer"), () => ({
  loadPdfViewer: vi.fn<typeof loadPdfViewer>(() => new Promise(() => {})),
}));
// The sidebar's default follows the breakpoint, so a test says whether the screen is a phone's before the viewer mounts
const device = vi.hoisted(() => ({ isPhone: false }));
vi.mock(import("@/composables/ui/useUiDisplay"), async (importOriginal) => {
  const actual = await importOriginal();

  return { ...actual, useUiDisplay: () => ({ ...actual.useUiDisplay(), mdAndDown: shallowRef(device.isPhone) }) };
});
// The package's viewer is kept as it is and only watched, so a test reads the options the dialog hands it
vi.mock(import("vue-pdfjs-headless"), async (importOriginal) => {
  const actual = await importOriginal();

  return { ...actual, usePdfViewer: vi.fn<typeof actual.usePdfViewer>(actual.usePdfViewer) };
});

// The viewer's state is the package's, so this file asserts the dialog's own part: the failure, the password prompt
// The password is handed back to the document, and no document is passed, so no page is ever shown
const mountViewer = (props: {
  highlightTerms?: string[];
  isFailed?: boolean;
  isPasswordRequested?: boolean;
  isPasswordWrong?: boolean;
}) =>
  mountSuspended(PdfViewer, {
    props: { filename: "report.pdf", isFailed: false, isPasswordRequested: false, isPasswordWrong: false, ...props },
  });
type Viewer = Awaited<ReturnType<typeof mountViewer>>;

// The test environment has no full screen, so the document gets the flag VueUse reads, and a request sets it as a browser does
const setFullscreen = (isOn: boolean) => {
  Object.defineProperty(document, "fullScreen", { configurable: true, value: isOn });
  document.dispatchEvent(new Event("fullscreenchange"));
};
// The More menu opens from its trigger's arrow key, as a reader's does, and reads its items from the menu
const openMenu = async (component: Viewer) => {
  await component.get('[aria-label="PDF actions"]').trigger("keydown", { key: "ArrowDown" });
  await flushPromises();

  return component.findAll('[role^="menuitem"]');
};
const chooseMenuItem = async (component: Viewer, title: string) => {
  const items = await openMenu(component);
  await items.find((item) => item.text() === title)?.trigger("click");
  await flushPromises();
};

describe("pdfViewer", () => {
  beforeEach(() => {
    device.isPhone = false;
    setFullscreen(false);
    Object.defineProperty(document, "exitFullscreen", { configurable: true, value: () => Promise.resolve() });
    Object.defineProperty(Element.prototype, "requestFullscreen", {
      configurable: true,
      value: vi.fn<() => Promise<void>>(() => {
        setFullscreen(true);

        return Promise.resolve();
      }),
    });
  });
  afterEach(() => {
    localStorage.clear();
    Reflect.deleteProperty(document, "fullScreen");
    Reflect.deleteProperty(document, "exitFullscreen");
    Reflect.deleteProperty(Element.prototype, "requestFullscreen");
  });

  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    // The viewer loads its own module as it mounts, and a viewer whose module never came draws no page either
    test("a viewer whose module fails to load says so", async () => {
      expect.hasAssertions();

      const error = new Error("a");
      vi.mocked(loadPdfViewer).mockRejectedValueOnce(error);
      const consoleError = vi.spyOn(console, "error").mockImplementation(noop);
      const component = await mountViewer({});
      await flushPromises();

      expect(component.text()).toContain("The PDF could not be loaded.");
      expect(consoleError).toHaveBeenCalledExactlyOnceWith(error);
    });

    test("a PDF that fails to load says so in place of its pages", async () => {
      expect.hasAssertions();

      const component = await mountViewer({ isFailed: true });

      expect(component.text()).toContain("The PDF could not be loaded.");
      expect(component.find('input[type="password"]').exists()).toBe(false);
    });

    test("a document still loading shows the spinner", async () => {
      expect.hasAssertions();

      const component = await mountViewer({});

      expect(component.findComponent(UiSpinner).exists()).toBe(true);
    });

    test("a password request shows the prompt in place of the spinner", async () => {
      expect.hasAssertions();

      const component = await mountViewer({ isPasswordRequested: true });

      expect(component.findComponent(UiSpinner).exists()).toBe(false);
    });

    test("a wrong password says so", async () => {
      expect.hasAssertions();

      const component = await mountViewer({ isPasswordRequested: true, isPasswordWrong: true });

      expect(component.text()).toContain("The password is wrong.");
    });

    test("opening a PDF with search terms", async () => {
      expect.hasAssertions();

      await mountViewer({ highlightTerms: ["invoice", "total"] });

      expect(toValue(vi.mocked(usePdfViewer).mock.lastCall?.[0].highlightTerms)).toStrictEqual(["invoice", "total"]);
    });

    test("opening a PDF without search terms", async () => {
      expect.hasAssertions();

      await mountViewer({});

      expect(toValue(vi.mocked(usePdfViewer).mock.lastCall?.[0].highlightTerms)).toStrictEqual([]);
    });

    test("the password is handed back to the document", async () => {
      expect.hasAssertions();

      const component = await mountViewer({ isPasswordRequested: true });
      await component.find('input[type="password"]').setValue("secret");
      await component
        .findAll("form")
        .find((form) => form.find('input[type="password"]').exists())
        ?.trigger("submit");
      await flushPromises();

      expect(component.emitted("submitPassword")).toStrictEqual([["secret"]]);
    });

    test("a wide screen starts with the sidebar open", async () => {
      expect.hasAssertions();

      const component = await mountViewer({});

      expect(component.find('[role="tablist"]').exists()).toBe(true);
    });

    test("a phone starts with the sidebar closed", async () => {
      expect.hasAssertions();

      device.isPhone = true;
      const component = await mountViewer({});

      expect(component.find('[role="tablist"]').exists()).toBe(false);
    });

    test("the reader's sidebar choice is remembered", async () => {
      expect.hasAssertions();

      const first = await mountViewer({});
      await first
        .findAll('[role="tab"]')
        .find((tab) => tab.text() === "Thumbnails")
        ?.trigger("click");
      await first.get('[aria-label="Sidebar"]').trigger("click");
      first.unmount();
      const second = await mountViewer({});

      expect(second.find('[role="tablist"]').exists()).toBe(false);

      await second.get('[aria-label="Sidebar"]').trigger("click");
      await flushPromises();

      expect(
        second
          .findAll('[role="tab"]')
          .find((tab) => tab.text() === "Thumbnails")
          ?.attributes("aria-selected"),
      ).toBe("true");
    });

    test("the sidebar covers the pages on a phone", async () => {
      expect.hasAssertions();

      device.isPhone = true;
      const component = await mountViewer({});
      await component.get('[aria-label="Sidebar"]').trigger("click");
      await flushPromises();
      // Layout is not drawn here, so this asserts the overlay's placement rather than its geometry
      // The sidebar is out of the row of pages and pinned to the start edge, and the pages keep the row's flexible box
      const sidebar = component.get('[role="tablist"]').element.closest("[absolute]");

      expect(sidebar?.hasAttribute("start-0")).toBe(true);
      expect(component.get(".pdfViewer").element.parentElement?.hasAttribute("flex-1")).toBe(true);
    });

    test("entering full screen", async () => {
      expect.hasAssertions();

      const component = await mountViewer({});
      await chooseMenuItem(component, "Full screen");
      const items = await openMenu(component);

      expect(vi.mocked(Element.prototype.requestFullscreen).mock.contexts).toStrictEqual([component.element]);
      expect(items.map((item) => item.text())).toContain("Exit full screen");
    });

    test("leaving full screen with Escape", async () => {
      expect.hasAssertions();

      const component = await mountViewer({});
      await chooseMenuItem(component, "Full screen");
      // The browser leaves full screen on Escape and reports it, which is the viewer's change to follow
      setFullscreen(false);
      await flushPromises();
      const items = await openMenu(component);

      expect(items.map((item) => item.text())).toContain("Full screen");
      expect(items.map((item) => item.text())).not.toContain("Exit full screen");
    });
  });
});
