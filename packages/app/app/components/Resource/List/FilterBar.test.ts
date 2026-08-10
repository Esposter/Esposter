// @vitest-environment nuxt
import ResourceListFilterBar from "@/components/Resource/List/FilterBar.vue";
import ResourceListStatusFilterPill from "@/components/Resource/List/StatusFilterPill.vue";
import ResourceListTagFilterPill from "@/components/Resource/List/TagFilterPill.vue";
import ResourceListUpdatedFilterPill from "@/components/Resource/List/UpdatedFilterPill.vue";
import { ResourceStatusFilter } from "@/models/resource/list/ResourceStatusFilter";
import { ResourceUpdatedFilter } from "@/models/resource/list/ResourceUpdatedFilter";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

// A filter type owns more than the one model its pill is named after, so removing its pill has to clear all of
// Them — a partial reset leaves a value filtering the list with no pill left to show it
describe("resourceListFilterBar", () => {
  const mountFilterBar = async () =>
    mountSuspended(ResourceListFilterBar, {
      props: {
        hasActiveFilters: true,
        status: ResourceStatusFilter.Published,
        tagName: "environment",
        tagValue: "production",
        types: [],
        updatedAfter: new Date(0),
        updatedBefore: new Date(0),
        updatedFilter: ResourceUpdatedFilter.Custom,
      },
    });

  test("removing the status pill clears the status", async () => {
    expect.hasAssertions();

    const component = await mountFilterBar();
    component.findComponent(ResourceListStatusFilterPill).vm.$emit("remove");
    await nextTick();

    expect(component.emitted("update:status")).toStrictEqual([[""]]);
  });

  test("removing the tag pill clears both the name and the value", async () => {
    expect.hasAssertions();

    const component = await mountFilterBar();
    component.findComponent(ResourceListTagFilterPill).vm.$emit("remove");
    await nextTick();

    expect(component.emitted("update:tagName")).toStrictEqual([[""]]);
    expect(component.emitted("update:tagValue")).toStrictEqual([[""]]);
  });

  test("removing the updated pill clears the preset and both custom bounds", async () => {
    expect.hasAssertions();

    const component = await mountFilterBar();
    component.findComponent(ResourceListUpdatedFilterPill).vm.$emit("remove");
    await nextTick();

    expect(component.emitted("update:updatedFilter")).toStrictEqual([[""]]);
    expect(component.emitted("update:updatedAfter")).toStrictEqual([[undefined]]);
    expect(component.emitted("update:updatedBefore")).toStrictEqual([[undefined]]);
  });
});
