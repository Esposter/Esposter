import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

import { pwa } from "./pwa.ts";

// A manifest names its icons by path, and a renamed or removed file fails nowhere but the install prompt, so each
// Icon the manifest lists is checked against the public folder it is served from
describe("pwa", () => {
  const publicDirectory = join(import.meta.dirname, "../public");
  const icons = pwa && pwa.manifest ? (pwa.manifest.icons ?? []) : [];

  test.each(icons)("serves the manifest icon $src", ({ src }) => {
    expect.hasAssertions();

    expect(existsSync(join(publicDirectory, src))).toBe(true);
  });
});
