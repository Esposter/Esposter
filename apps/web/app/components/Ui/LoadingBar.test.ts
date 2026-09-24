// @vitest-environment happy-dom
import UiLoadingBar from "@/components/Ui/LoadingBar.vue";
import { setupUiStyle } from "@/components/Ui/setupUiStyle.test";
import { UiStyles } from "@/models/ui/UiStyle";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiLoadingBar", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    test("is a named progress bar reporting how much is done", async () => {
      expect.hasAssertions();

      const label = "label";
      const value = 50;
      const component = mount(UiLoadingBar, { props: { label, value } });
      await flushPromises();
      const progressbar = component.get('[role="progressbar"]');

      expect(progressbar.attributes("aria-label")).toBe(label);
      expect(progressbar.attributes("aria-valuenow")).toBe(String(value));
      expect(progressbar.attributes("aria-valuemin")).toBe("0");
      expect(progressbar.attributes("aria-valuemax")).toBe("100");
    });
  });
});
