// @vitest-environment nuxt
import type { ContentNavigationItem } from "@nuxt/content";

import DocsCategoryTabs from "@/components/Docs/CategoryTabs.vue";
import { DocsCategory } from "@/models/docs/DocsCategory";
import { RoutePath } from "@esposter/shared";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { describe, expect, test } from "vitest";
import { RouterLink } from "vue-router";

const readTabs = (element: Element) =>
  [...element.querySelectorAll(".v-tab")].map((tab) => ({
    isColored: tab.classList.contains("text-primary"),
    isSelected: tab.classList.contains("v-tab--selected"),
    title: tab.textContent?.trim(),
  }));

describe("docsCategoryTabs", () => {
  // Real DocsCategorySectionsMap slugs: architecture/infra are Architecture, achievements/esbabbler are Products
  const sections = ["architecture", "infra", "achievements", "esbabbler"].map((slug): ContentNavigationItem => ({
    path: `${RoutePath.Docs}/${slug}`,
    title: slug,
  }));
  // Highlighting is Vuetify's router-link state, so the tabs need the real RouterLink — mountSuspended otherwise
  // Swaps in a stub with no useLink, which leaves every tab permanently inactive and the assertions vacuous
  const mountTabs = (route: string, activeCategory?: DocsCategory) =>
    mountSuspended(DocsCategoryTabs, {
      global: { components: { RouterLink } },
      props: { activeCategory, sections },
      route,
    });

  test("highlights only the overview tab on the docs root", async () => {
    expect.hasAssertions();

    const component = await mountTabs(RoutePath.Docs);

    expect(readTabs(component.element)).toStrictEqual([
      { isColored: true, isSelected: true, title: "Overview" },
      { isColored: false, isSelected: false, title: "Architecture" },
      { isColored: false, isSelected: false, title: "Products" },
    ]);
  });

  // "/docs" resolves with no slug param at all, so vue-router counts its link as active on every docs page
  test("highlights only the active category tab on a nested page of its first section", async () => {
    expect.hasAssertions();

    const component = await mountTabs(`${RoutePath.Docs}/architecture/monorepo-tooling`, DocsCategory.Architecture);

    expect(readTabs(component.element)).toStrictEqual([
      { isColored: false, isSelected: false, title: "Overview" },
      { isColored: true, isSelected: true, title: "Architecture" },
      { isColored: false, isSelected: false, title: "Products" },
    ]);
  });

  // A category spans several sections, so its tab cannot link to one path that covers them all
  test("highlights only the active category tab outside the section its tab links to", async () => {
    expect.hasAssertions();

    const component = await mountTabs(`${RoutePath.Docs}/esbabbler/calls`, DocsCategory.Products);

    expect(readTabs(component.element)).toStrictEqual([
      { isColored: false, isSelected: false, title: "Overview" },
      { isColored: false, isSelected: false, title: "Architecture" },
      { isColored: true, isSelected: true, title: "Products" },
    ]);
  });
});
