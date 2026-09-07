// @vitest-environment nuxt
import ResourceSearchResultList from "@/components/Resource/Search/ResultList.vue";
import { ResourceSearchGroup } from "@/models/resource/search/ResourceSearchGroup";
import { ResourceType } from "@esposter/db-schema";
import { RoutePath } from "@esposter/shared";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test, vi } from "vitest";

// The create button's handler navigates, and a real navigation resolves route middleware through a dynamic
// Import that outlives the assertion — it lands in a torn-down environment and fails the run as an unhandled
// Rejection. No test here asserts on the destination, so the navigation itself is stubbed out
mockNuxtImport("navigateTo", () => vi.fn<typeof navigateTo>());

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
        seeAllTo: RoutePath.ResourceExplorerAll,
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
            createTo: RoutePath.ResourceExplorerCreateType(ResourceType.Sheet),
            group: ResourceSearchGroup.Services,
            icon: "mdi-file-outline",
            id,
            title: "name",
            to: RoutePath.ResourceExplorerAll,
          },
        ],
        searchQuery,
        seeAllTo: RoutePath.ResourceExplorerAll,
        selectedIndex: -1,
      },
    });
    const event = new MouseEvent("click", { bubbles: true, cancelable: true });
    component.get(".v-list-item__append button").element.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
  });

  test("renders the see-all footer as a real link", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(ResourceSearchResultList, {
      props: { items: [], searchQuery, seeAllTo: RoutePath.ResourceExplorerAll, selectedIndex: -1 },
    });

    expect(component.findAll(".v-list-item").at(-1)?.element.tagName).toBe("A");
  });
});
