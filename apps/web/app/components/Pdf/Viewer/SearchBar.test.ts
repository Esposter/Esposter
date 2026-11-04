// @vitest-environment happy-dom
import { createPdfViewerState } from "@/components/Pdf/Viewer/createPdfViewerState.fixture";
import PdfViewerSearchBar from "@/components/Pdf/Viewer/SearchBar.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

const mountSearchBar = (viewer = createPdfViewerState()) => mount(PdfViewerSearchBar, { props: { viewer } });

describe("pdfViewerSearchBar", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test("pressing Enter in the search field goes to the next match", async () => {
      expect.hasAssertions();

      const viewer = createPdfViewerState({ matchesCount: ref({ current: 1, total: 3 }) });
      const component = mountSearchBar(viewer);
      await component.get("form").trigger("submit");
      await flushPromises();

      expect(viewer.findNext).toHaveBeenCalledExactlyOnceWith();
    });

    test("the count reads the match in view out of the total", () => {
      expect.hasAssertions();

      const component = mountSearchBar(
        createPdfViewerState({ matchesCount: ref({ current: 2, total: 5 }), searchQuery: ref("word") }),
      );

      expect(component.get('[aria-live="polite"]').text()).toBe("2 of 5");
    });

    test("a search that finds no match says so, and its match buttons are unavailable", () => {
      expect.hasAssertions();

      const component = mountSearchBar(
        createPdfViewerState({
          isNotFound: ref(true),
          matchesCount: ref({ current: 0, total: 0 }),
          searchQuery: ref("missing"),
        }),
      );

      expect(component.get('[aria-live="polite"]').text()).toBe("No matches");
      expect(component.get('[aria-label="Next match"]').attributes("disabled")).toBeDefined();
    });
  });
});
