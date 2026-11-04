// @vitest-environment happy-dom
import { createPdfViewerState } from "@/components/Pdf/Viewer/createPdfViewerState.fixture";
import PdfViewerWatermarkDialog from "@/components/Pdf/Viewer/WatermarkDialog.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import { beforeEach, describe, expect, test } from "vitest";

const mountDialog = (viewer = createPdfViewerState()) => {
  const component = mount(PdfViewerWatermarkDialog, {
    attachTo: document.body,
    props: { filename: "report.pdf", modelValue: true, viewer },
  });

  return { component, viewer };
};
// The dialog's own buttons are read from the document, since the shell draws them outside the component's element
const getButton = (label: string) =>
  [...document.body.querySelectorAll<HTMLButtonElement>("dialog button")].find(
    (button) => button.textContent.trim() === label,
  );

describe("pdfViewerWatermarkDialog", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test("an empty watermark cannot be downloaded", async () => {
      expect.hasAssertions();

      mountDialog();
      await flushPromises();

      expect(getButton("Download")?.hasAttribute("disabled")).toBe(true);
    });

    test("downloading with a watermark saves the document with that text", async () => {
      expect.hasAssertions();

      const { component, viewer } = mountDialog();
      await flushPromises();
      await component.get("input").setValue("DRAFT");
      getButton("Download")?.click();
      await flushPromises();

      expect(viewer.download).toHaveBeenCalledExactlyOnceWith("report.pdf", "DRAFT");
    });

    test("cancelling saves nothing", async () => {
      expect.hasAssertions();

      const { component, viewer } = mountDialog();
      await flushPromises();
      await component.get("input").setValue("DRAFT");
      getButton("Cancel")?.click();
      await flushPromises();

      expect(viewer.download).not.toHaveBeenCalled();
    });
  });
});
