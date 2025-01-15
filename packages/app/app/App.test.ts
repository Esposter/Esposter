import { trimFileExtension } from "@/util/trimFileExtension";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";
import { createVuetify } from "vuetify";

describe("app", () => {
  test("snapshots", async () => {
    expect.hasAssertions();

    const componentFilepathEntries = Object.entries<Record<string, Component>>(
      import.meta.glob("@/components/About/*.vue", { eager: true, import: "default" }),
    );

    for (const [filepath, component] of componentFilepathEntries) {
      const mountedComponent = await mountSuspended(component, {
        global: {
          plugins: [createVuetify()],
        },
      });
      const filename = trimFileExtension(filepath);

      await expect(mountedComponent.html()).toMatchFileSnapshot(`__snapshots__/${filename}.html`);
    }
  });
});
