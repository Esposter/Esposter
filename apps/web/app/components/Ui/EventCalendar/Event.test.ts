// @vitest-environment nuxt
import type { UiCalendarEvent } from "#src/models/ui/UiCalendarEvent";

import UiEventCalendarEvent from "#src/components/Ui/EventCalendar/Event.vue";
import { setupUiStyle } from "#src/components/Ui/setupUiStyle.test";
import { UiStyles } from "#src/models/ui/UiStyle";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("uiEventCalendarEvent", () => {
  describe.each(UiStyles)("%s", (uiStyle) => {
    setupUiStyle(uiStyle);

    // The description is rich text from whichever caller passes it, so the markup a caller did not sanitise must not
    // Reach the page: an image whose load handler runs script is the attack
    test("draws a description's text, and no handler in its markup", async () => {
      expect.hasAssertions();

      const event: UiCalendarEvent = {
        description: 'Notes<img src="x" onerror="alert(1)">',
        id: "id",
        start: new Date(0),
        title: "title",
      };
      const now = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC");
      const component = await mountSuspended(UiEventCalendarEvent, { attachTo: document.body, props: { event, now } });
      await component.get("button").trigger("pointerenter");
      await flushPromises();

      expect(document.body.textContent).toContain("Notes");
      expect(document.body.innerHTML).not.toContain("onerror");
    });
  });
});
