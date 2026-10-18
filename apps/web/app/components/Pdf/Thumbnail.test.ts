// @vitest-environment nuxt
import PdfThumbnail from "@/components/Pdf/Thumbnail.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("pdfThumbnail", () => {
  // A PDF that fails to load hides its page and says so, since no page is drawn to show
  test("a PDF that fails to load says so in place of its page", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(PdfThumbnail, { props: { isFailed: true } });

    expect(component.text()).toContain("The PDF could not be loaded.");
    expect(component.find("canvas").attributes("style")).toContain("display: none");
  });
});
