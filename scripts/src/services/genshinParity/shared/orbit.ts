/* oxlint-disable no-underscore-dangle -- the names are the page's own globals, which the page sets and these read back by name */

import type { Page } from "playwright";

// Mouse look turns 0.002 radians a pixel, and a full turn is spread over six seconds of events every 16 milliseconds
const MOUSE_LOOK_RADIANS_PER_PIXEL = 0.002;
const ORBIT_EVENT_MS = 16;
const ORBIT_MOUSE_PIXELS = (2 * Math.PI) / MOUSE_LOOK_RADIANS_PER_PIXEL;

export const orbit = (page: Page, orbitDurationMs: number): Promise<void> =>
  page.evaluate(
    ({ durationMs, eventMs, mousePixels }) =>
      new Promise<void>((resolve) => {
        window.__fakeLock = true;
        const startMs = performance.now();
        let sentPixels = 0;
        // The browser truncates an event's movement to whole pixels, so each event sends the whole pixels the turn owes by
        // Its time, and a late timer neither truncates nor drops any of the turn
        const timer = setInterval(() => {
          const progress = Math.min((performance.now() - startMs) / durationMs, 1);
          const movementX = Math.round(mousePixels * progress) - sentPixels;
          sentPixels += movementX;
          window.dispatchEvent(new MouseEvent("mousemove", { bubbles: true, movementX, movementY: 0 }));
          if (progress < 1) return;
          clearInterval(timer);
          window.__fakeLock = false;
          resolve();
        }, eventMs);
      }),
    { durationMs: orbitDurationMs, eventMs: ORBIT_EVENT_MS, mousePixels: ORBIT_MOUSE_PIXELS },
  );
