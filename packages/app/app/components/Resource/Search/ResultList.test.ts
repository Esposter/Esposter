// @vitest-environment nuxt
import ResourceSearchResultList from "@/components/Resource/Search/ResultList.vue";
import { ResourceSearchGroup } from "@/models/resource/search/ResourceSearchGroup";
import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import { describe, expect, test } from "vitest";

describe("resourceSearchResultList", () => {
  const id = crypto.randomUUID();
  const searchQuery = " ";

  // A click handler is not a link: with no destination on the element, middle-click does nothing, ctrl/cmd-click
  // Replaces the page the user is on instead of opening a background tab, and "Copy link address" and the hover
  // Status-bar preview have nothing to read. A row that took its route renders as an anchor; one that never saw
  // It stays a <div>
  test("renders a result as a real link", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceSearchResultList, {
      props: {
        items: [
          {
            group: ResourceSearchGroup.Resources,
            icon: "mdi-file-outline",
            id,
            title: "name",
            to: RoutePath.Resource(id),
          },
        ],
        searchQuery,
        seeAllTo: RoutePath.ResourcesAll,
        selectedIndex: -1,
      },
    });

    expect(component.get(".v-list-item").element.tagName).toBe("A");
  });

  // The row is an anchor, so stopping the Create click short of it is not enough — the browser follows the row's
  // Href regardless, hard-loading the type-filtered list on top of the create form the button just routed to
  test("cancels the row's navigation when the create button is clicked", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceSearchResultList, {
      props: {
        items: [
          {
            createTo: RoutePath.ResourcesCreateType(ResourceType.Sheet),
            group: ResourceSearchGroup.Services,
            icon: "mdi-file-outline",
            id,
            title: "name",
            to: RoutePath.ResourcesAll,
          },
        ],
        searchQuery,
        seeAllTo: RoutePath.ResourcesAll,
        selectedIndex: -1,
      },
    });
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    component.get(".v-list-item__append button").element.dispatchEvent(event);
    // The button's own handler navigates, and nothing here holds that promise — left to settle after the test,
    // It lands in a torn-down environment where the router's scroll behaviour reads a `window` that is gone
    await flushPromises();

    expect(event.defaultPrevented).toBe(true);
  });

  test("renders the see-all footer as a real link", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceSearchResultList, {
      props: { items: [], searchQuery, seeAllTo: RoutePath.ResourcesAll, selectedIndex: -1 },
    });

    expect(component.findAll(".v-list-item").at(-1)?.element.tagName).toBe("A");
  });
});
