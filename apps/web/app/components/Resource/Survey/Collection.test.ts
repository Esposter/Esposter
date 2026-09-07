// @vitest-environment nuxt
import ResourceSurveyCollection from "@/components/Resource/Survey/Collection.vue";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceSurveyCollection", () => {
  // The store hands its settings over as a reactive proxy and structuredClone refuses to clone one, so an
  // Immediate sync useCloned running during setup throws and takes the whole Overview blade down with it
  test("mounts against the store's reactive settings", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceSurveyCollection);

    expect(component.find(".v-switch").exists()).toBe(true);
  });
});
