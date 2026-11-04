// @vitest-environment happy-dom
import type { PdfComment } from "vue-pdfjs-headless";

import PdfViewerComments from "@/components/Pdf/Viewer/Comments.vue";
import { createPdfAnnotationsState } from "@/components/Pdf/Viewer/createPdfAnnotationsState.fixture";
import { createPdfViewerState } from "@/components/Pdf/Viewer/createPdfViewerState.fixture";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

const mountComments = (comments: PdfComment[] | undefined, viewer = createPdfViewerState()) =>
  mount(PdfViewerComments, {
    props: { annotations: createPdfAnnotationsState({ comments: shallowRef(comments) }), viewer },
  });

describe("pdfViewerComments", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test("the comments are listed by page and text", () => {
      expect.hasAssertions();

      const component = mountComments([{ contents: "a", pageNumber: 2 }]);

      expect(component.findAll("button").map((button) => button.text())).toStrictEqual(["Page 2 a"]);
    });

    test("choosing a comment goes to its page", async () => {
      expect.hasAssertions();

      const viewer = createPdfViewerState();
      const component = mountComments([{ contents: "a", pageNumber: 2 }], viewer);
      await component
        .findAll("button")
        .find((button) => button.text() === "Page 2 a")
        ?.trigger("click");

      expect(viewer.goToPage).toHaveBeenCalledExactlyOnceWith(2);
    });

    test("a document with no comments says so", () => {
      expect.hasAssertions();

      const component = mountComments([]);

      expect(component.text()).toContain("This PDF has no comments");
    });

    test("comments still being read are loading", () => {
      expect.hasAssertions();

      const component = mountComments(undefined);

      expect(component.findAll(".skeleton")).toHaveLength(3);
      expect(component.text()).not.toContain("This PDF has no comments");
    });
  });
});
