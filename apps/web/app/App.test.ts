// @vitest-environment nuxt
import { trimFileExtension } from "@/util/file/trimFileExtension";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("app", () => {
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

        await expect(mountedComponent.html()).toMatchFileSnapshot(`__snapshots__/${filename}.html`);
      }),
    );
  });
});
