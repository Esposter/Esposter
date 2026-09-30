// @vitest-environment nuxt
import { trimFileExtension } from "@/util/file/trimFileExtension";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { dirname } from "node:path";
import { describe, expect, test } from "vitest";

describe("app", () => {
  // The web app's root, which each component's glob key is a path from
  const WEB_DIRECTORY = dirname(import.meta.dirname);

  test("snapshots", async () => {
    expect.hasAssertions();

    await Promise.all(
      Object.entries(
        import.meta.glob<Component>(
          [
            "@/components/About/**/*.vue",
            "@/components/Anime/**/*.vue",
            "@/components/Nuxt/**/*.vue",
            "@/components/Transition/**/*.vue",
          ],
          { eager: true, import: "default" },
        ),
      ).map(async ([filepath, component]) => {
        // A WebGL scene has no canvas to draw on here, and the Tres module is outside Vitest's allowlist
        const mountedComponent = await mountSuspended(component, { global: { stubs: { VisualGem: true } } });
        const filename = trimFileExtension(filepath);

        // Beside its component, as a test sits beside its code
        await expect(mountedComponent.html()).toMatchFileSnapshot(`${WEB_DIRECTORY}${filename}.snapshot.html`);
      }),
    );
  });
});
