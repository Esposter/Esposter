// @vitest-environment happy-dom
import type { PdfOutline } from "vue-pdfjs-headless";

import { createPdfViewerState } from "@/components/Pdf/Viewer/createPdfViewerState.test";
import PdfViewerOutline from "@/components/Pdf/Viewer/Outline.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

const createNode = (title: string, items: PdfOutline = []): PdfOutline[number] => ({
  bold: false,
  color: new Uint8ClampedArray(),
  count: undefined,
  dest: title,
  italic: false,
  items,
  newWindow: undefined,
  title,
  unsafeUrl: undefined,
  url: null,
});
const mountOutline = (outline: PdfOutline | undefined) =>
  mount(PdfViewerOutline, {
    props: { viewer: createPdfViewerState({ outline: shallowRef<PdfOutline | undefined>(outline) }) },
  });

describe("pdfViewerOutline", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test("following an outline entry", async () => {
      expect.hasAssertions();

      const chapter = createNode("Chapter");
      const viewer = createPdfViewerState({ outline: shallowRef<PdfOutline | undefined>([chapter]) });
      const component = mount(PdfViewerOutline, { props: { viewer } });
      await component
        .findAll("button")
        .find((button) => button.text() === "Chapter")
        ?.trigger("click");

      expect(viewer.followBookmark).toHaveBeenCalledExactlyOnceWith(chapter);
    });

    test("an outline entry with no destination is plain text, not a button", async () => {
      expect.hasAssertions();

      const link: PdfOutline[number] = { ...createNode("Link"), dest: null, url: "https://example.com" };
      const viewer = createPdfViewerState({ outline: shallowRef<PdfOutline | undefined>([link]) });
      const component = mount(PdfViewerOutline, { props: { viewer } });
      await component.get("span[style]").trigger("click");

      expect(component.findAll("button")).toHaveLength(0);
      expect(component.text()).toContain("Link");
      expect(viewer.followBookmark).not.toHaveBeenCalled();
    });

    test("a nested entry sits under its parent", () => {
      expect.hasAssertions();

      const component = mountOutline([createNode("Chapter 1", [createNode("Section 1.1")])]);
      const rows = component.findAll("button").map((button) => button.text());
      // Each title's indent is its own style, so the parent's is first and the nested entry's follows it
      const indents = component.findAll("span[style]").map((span) => span.attributes("style"));

      expect(rows).toStrictEqual(["Chapter 1", "Section 1.1"]);
      expect(indents[0]).toContain("0rem");
      expect(indents[1]).toContain("1rem");
    });

    test("a document with no outline says so", () => {
      expect.hasAssertions();

      const component = mountOutline([]);

      expect(component.text()).toContain("This PDF has no outline");
    });

    test("an outline still being read is loading", () => {
      expect.hasAssertions();

      const component = mountOutline(undefined);

      expect(component.findAll(".skeleton")).toHaveLength(3);
      expect(component.text()).not.toContain("This PDF has no outline");
    });
  });
});
