import type { ContentNavigationItem } from "@nuxt/content";

import { getSortedNavigationItems } from "@/services/docs/getSortedNavigationItems";
import { describe, expect, test } from "vitest";

const createItem = (path: string, children?: ContentNavigationItem[]): ContentNavigationItem => ({
  children,
  path,
  title: path.split("/").at(-1) ?? "",
});

describe(getSortedNavigationItems, () => {
  test("sorts architecture first, areas alphabetically, proposals last", () => {
    expect.hasAssertions();

    const items = getSortedNavigationItems([
      createItem("/docs/proposals"),
      createItem("/docs/esbabbler"),
      createItem("/docs/architecture"),
      createItem("/docs/clicker"),
    ]);

    expect(items.map(({ path }) => path)).toStrictEqual([
      "/docs/architecture",
      "/docs/clicker",
      "/docs/esbabbler",
      "/docs/proposals",
    ]);
  });

  test("sorts area children as features, roadmap, deferred, rejected", () => {
    expect.hasAssertions();

    const items = getSortedNavigationItems([
      createItem("/docs/esbabbler", [
        createItem("/docs/esbabbler/rejected"),
        createItem("/docs/esbabbler/deferred"),
        createItem("/docs/esbabbler/roadmap"),
        createItem("/docs/esbabbler/messaging"),
        createItem("/docs/esbabbler/calls"),
      ]),
    ]);

    expect(items[0]?.children?.map(({ path }) => path)).toStrictEqual([
      "/docs/esbabbler/calls",
      "/docs/esbabbler/messaging",
      "/docs/esbabbler/roadmap",
      "/docs/esbabbler/deferred",
      "/docs/esbabbler/rejected",
    ]);
  });

  test("does not throw when navigation items lack a title", () => {
    expect.hasAssertions();

    const items = getSortedNavigationItems([
      { path: "/docs/clicker" },
      { path: "/docs/esbabbler" },
    ] as ContentNavigationItem[]);

    expect(items.map(({ path }) => path)).toStrictEqual(["/docs/clicker", "/docs/esbabbler"]);
  });
});
