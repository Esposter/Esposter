// @vitest-environment nuxt
import PdfThumbnail from "@/components/Pdf/Thumbnail.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { afterEach, describe, expect, test } from "vitest";

describe("pdfThumbnail", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  // A PDF that fails to load hides its page and says so, since no page is drawn to show
  test("a PDF that fails to load says so in place of its page", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(PdfThumbnail, { attachTo: document.body, props: { isFailed: true } });

    expect(component.text()).toContain("The PDF could not be loaded.");
    expect(component.find("canvas").isVisible()).toBe(false);
  });
});
