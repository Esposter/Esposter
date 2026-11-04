// @vitest-environment nuxt
import PdfViewer from "@/components/Pdf/Viewer/Index.vue";
import UiSpinner from "@/components/Ui/Spinner.vue";
import { loadPdfViewer } from "@/services/pdf/loadPdfViewer";
import { noop } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";
import { usePdfViewer } from "vue-pdfjs-headless";

// The viewer's module never loads here unless a test rejects it, so each test sees the dialog at the state its props give
vi.mock(import("@/services/pdf/loadPdfViewer"), () => ({
  loadPdfViewer: vi.fn<typeof loadPdfViewer>(() => new Promise(() => {})),
}));
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

describe("pdfViewer", () => {
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

  test("a viewer given search terms highlights them when its document loads", async () => {
    expect.hasAssertions();

    await mountViewer({ highlightTerms: ["invoice", "total"] });

    expect(toValue(vi.mocked(usePdfViewer).mock.lastCall?.[0].highlightTerms)).toStrictEqual(["invoice", "total"]);
  });

  test("a viewer given no search terms highlights nothing", async () => {
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
});
