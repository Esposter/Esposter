// @vitest-environment nuxt
import StyledNavigationList from "@/components/Styled/Navigation/List.vue";
import { RoutePath } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";

describe("styledNavigationList", () => {
  const items = [
    { icon: "", isActive: true, title: "", to: RoutePath.ResourceExplorer },
    { icon: "", isActive: false, title: "a", to: RoutePath.ResourceExplorerAll },
  ];

  // The rail, the mobile dropdown and the drawer all render through this one list, so the row shape it produces
  // Is the contract all three inherit
  test("renders one entry per item, highlighting the one the caller marked active", async () => {
    expect.hasAssertions();

    const component = await mountSuspended(StyledNavigationList, { props: { items } });

    expect(component.findAll("a").map((link) => link.text())).toStrictEqual(["", "a"]);
    expect(component.findAll(".v-list-item--active")).toHaveLength(1);
  });
});
