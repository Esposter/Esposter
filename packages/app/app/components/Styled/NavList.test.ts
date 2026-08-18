// @vitest-environment nuxt
import StyledNavList from "@/components/Styled/NavList.vue";
import { RoutePath } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("styledNavList", () => {
  const items = [
    { icon: "mdi-home-outline", isActive: true, title: "Home", to: RoutePath.ResourceExplorer },
    { icon: "mdi-view-list-outline", isActive: false, title: "All", to: RoutePath.ResourceExplorerAll },
  ];

  // The rail, the mobile dropdown and the drawer all render through this one list, so the row shape it produces
  // Is the contract all three inherit
  test("renders one entry per item, highlighting the one the caller marked active", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledNavList, { props: { items } });

    expect(component.findAll("a").map((link) => link.text())).toStrictEqual(["Home", "All"]);
    expect(component.findAll(".v-list-item--active")).toHaveLength(1);
  });
});
