// @vitest-environment nuxt
import { createResourceListItem } from "#shared/services/resource/list/createResourceListItem.test";
import ResourceHomeList from "@/components/Resource/Home/List.vue";
import ResourceHomeListItem from "@/components/Resource/Home/ListItem.vue";
import UiEmptyState from "@/components/Ui/EmptyState.vue";
import { ResourceListSource } from "@/models/resource/list/ResourceListSource";
import { RECENT_RESOURCES_LIMIT } from "@/services/resource/constants";
import { ResourceListSourceDefinitionMap } from "@/services/resource/list/ResourceListSourceDefinitionMap";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("resourceHomeList", () => {
  const source = ResourceListSource.Favorites;

  test("draws the loading cards while the read is out", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceHomeList, { props: { isPending: true, resources: [], source } });

    expect(component.findAll(".skeleton")).toHaveLength(RECENT_RESOURCES_LIMIT);
    expect(component.findComponent(ResourceHomeListItem).exists()).toBe(false);
  });

  test("an empty set draws the empty state of its own view", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceHomeList, { props: { resources: [], source } });

    expect(component.findComponent(UiEmptyState).props("title")).toBe(
      ResourceListSourceDefinitionMap[source].emptyState.title,
    );
  });

  test("the cards are drawn once the set has rows", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceHomeList, {
      global: { stubs: { ResourceHomeListItem: true } },
      props: { resources: [createResourceListItem()], source },
    });

    expect(component.findAllComponents(ResourceHomeListItem)).toHaveLength(1);
    expect(component.findComponent(UiEmptyState).exists()).toBe(false);
  });
});
