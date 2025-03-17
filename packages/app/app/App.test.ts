import { trimFileExtension } from "@/util/trimFileExtension";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";
import { createVuetify } from "vuetify";

const vuetify = createVuetify();

// @TODO: Enable this when snapshots are consistent
describe.todo("app", () => {
  test("snapshots", async () => {
    expect.hasAssertions();

    const componentFilepathEntries = Object.entries(
      import.meta.glob<Component>(
        [
          "@/components/About/**/*.vue",
          "@/components/Anime/**/*.vue",
          "@/components/Nuxt/**/*.vue",
          "@/components/Transition/**/*.vue",
        ],
        {
          eager: true,
          import: "default",
        },
      ),
    );

    for (const [filepath, component] of componentFilepathEntries) {
      const mountedComponent = await mountSuspended(component, {
        global: {
          plugins: [vuetify],
        },
      });
      const filename = trimFileExtension(filepath);

      await expect(mountedComponent.html()).toMatchFileSnapshot(`__snapshots__/${filename}.html`);
    }
  });
});
