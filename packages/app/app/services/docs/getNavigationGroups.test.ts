import type { ContentNavigationItem } from "@nuxt/content";

import { getNavigationGroups } from "@/services/docs/getNavigationGroups";
import { describe, expect, test } from "vitest";

const createItem = (path: string): ContentNavigationItem => ({
  path,
  title: path.split("/").at(-1) ?? "",
});

describe(getNavigationGroups, () => {
  test("unmapped section keeps feature pages ungrouped and trails planning pages", () => {
    expect.hasAssertions();

    const groups = getNavigationGroups("/docs/posts", [
      createItem("/docs/posts/likes"),
      createItem("/docs/posts/roadmap"),
      createItem("/docs/posts/deferred"),
      createItem("/docs/posts/rejected"),
    ]);

    expect(groups.map(({ items, title }) => ({ paths: items.map(({ path }) => path), title }))).toStrictEqual([
      { paths: ["/docs/posts/likes"], title: undefined },
      { paths: ["/docs/posts/roadmap", "/docs/posts/deferred", "/docs/posts/rejected"], title: "Planning" },
    ]);
  });

  test("mapped section orders groups by declaration order with unmapped pages leading", () => {
    expect.hasAssertions();

    const groups = getNavigationGroups("/docs/virrun", [
      createItem("/docs/virrun/cache"),
      createItem("/docs/virrun/architecture"),
      createItem("/docs/virrun/new-unmapped-page"),
    ]);

    expect(groups.map(({ items, title }) => ({ paths: items.map(({ path }) => path), title }))).toStrictEqual([
      { paths: ["/docs/virrun/new-unmapped-page"], title: undefined },
      { paths: ["/docs/virrun/architecture"], title: "Core" },
      { paths: ["/docs/virrun/cache"], title: "Performance" },
    ]);
  });

  test("returns no groups for no items", () => {
    expect.hasAssertions();

    expect(getNavigationGroups("/docs/virrun", [])).toStrictEqual([]);
  });
});
