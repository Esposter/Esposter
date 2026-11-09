// @vitest-environment happy-dom
import type { ResourceInResource } from "@esposter/db-schema";

import ResourceBladeOutlet from "@/components/Resource/Blade/Outlet.vue";
import { ResourceBladeSlug } from "@/models/resource/ResourceBladeSlug";
import { ResourceType } from "@esposter/db-schema";
import { flushPromises, mount } from "@vue/test-utils";
import { describe, expect, test, vi } from "vitest";

// A type's own blade is a stub that draws one paragraph, so the outlet's wrapper is what is under test
vi.mock(import("@/services/resource/ResourceBladeDefinitionMap"), async (importOriginal) => {
  const { ResourceBladeDefinitionMap } = await importOriginal();
  const { ResourceType: MockedResourceType } = await import("@esposter/db-schema");
  const { ResourceBladeSlug: MockedResourceBladeSlug } = await import("@/models/resource/ResourceBladeSlug");
  const { defineComponent, h } = await import("vue");
  const StubBlade = defineComponent(() => () => h("p", "stub blade"));

  return {
    ResourceBladeDefinitionMap: {
      ...ResourceBladeDefinitionMap,
      [MockedResourceType.Sheet]: [
        { component: StubBlade, icon: "", slug: MockedResourceBladeSlug.Data, title: "Stub" },
      ],
    },
  };
});

const resource = { id: "resource", type: ResourceType.Sheet } as ResourceInResource;

describe("resourceBladeOutlet", () => {
  // The outlet owns the padding and the scroll a blade used to write, so a blade's content is padded and scrolls
  // inside the outlet's body. jsdom measures no layout, so the overflow itself is proven in a driven browser
  test("A blade's content is padded and scrolls", async () => {
    expect.hasAssertions();

    const component = mount(ResourceBladeOutlet, { props: { activeBlade: ResourceBladeSlug.Data, resource } });
    await flushPromises();
    const body = component.get(".ui-region-body");

    expect(body.classes()).toContain("p-3");
    expect(body.element.contains(component.get("p").element)).toBe(true);
  });

  // The editor is a full-bleed canvas that lays out its own regions, so the outlet draws it with no wrapper and no padding
  test("The editor blade is full-bleed and keeps no wrapper", async () => {
    expect.hasAssertions();

    const component = mount(ResourceBladeOutlet, { props: { activeBlade: "editor", resource } });
    await flushPromises();

    expect(component.find(".ui-region-body").exists()).toBe(false);
    expect(component.find(".contents").exists()).toBe(true);
  });
});
