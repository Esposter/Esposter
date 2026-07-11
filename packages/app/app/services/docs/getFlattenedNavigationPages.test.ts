import type { ContentNavigationItem } from "@nuxt/content";

import { getFlattenedNavigationPages } from "@/services/docs/getFlattenedNavigationPages";
import { describe, expect, test } from "vitest";

const createItem = (path: string, children?: ContentNavigationItem[]): ContentNavigationItem => ({
  children,
  path,
  title: path.split("/").at(-1) ?? "",
});

describe(getFlattenedNavigationPages, () => {
  test("section overview leads, planning pages trail after feature pages", () => {
    expect.hasAssertions();

    // Children arrive pre-sorted by getSortedNavigationItems — features first, then roadmap, deferred
    const pages = getFlattenedNavigationPages([
      createItem("/docs/posts", [
        createItem("/docs/posts/likes"),
        createItem("/docs/posts/roadmap"),
        createItem("/docs/posts/deferred"),
      ]),
    ]);

    expect(pages.map(({ path }) => path)).toStrictEqual([
      "/docs/posts",
      "/docs/posts/likes",
      "/docs/posts/roadmap",
      "/docs/posts/deferred",
    ]);
  });

  test("mapped section walks groups in declaration order", () => {
    expect.hasAssertions();

    const pages = getFlattenedNavigationPages([
      createItem("/docs/virrun", [
        createItem("/docs/virrun/cache"),
        createItem("/docs/virrun/architecture"),
        createItem("/docs/virrun/new-unmapped-page"),
      ]),
    ]);

    expect(pages.map(({ path }) => path)).toStrictEqual([
      "/docs/virrun",
      "/docs/virrun/new-unmapped-page",
      "/docs/virrun/architecture",
      "/docs/virrun/cache",
    ]);
  });

  test("nested folder pages flatten after their folder overview, skipping self-index and pageless folders", () => {
    expect.hasAssertions();

    const pages = getFlattenedNavigationPages([
      createItem("/docs/esbabbler", [
        createItem("/docs/esbabbler/calls", [
          createItem("/docs/esbabbler/calls"),
          createItem("/docs/esbabbler/calls/picture-in-picture"),
        ]),
        { ...createItem("/docs/esbabbler/pageless", [createItem("/docs/esbabbler/pageless/child")]), page: false },
      ]),
    ]);

    // "pageless" is unmapped for esbabbler so its pages lead the mapped Calls group
    expect(pages.map(({ path }) => path)).toStrictEqual([
      "/docs/esbabbler",
      "/docs/esbabbler/pageless/child",
      "/docs/esbabbler/calls",
      "/docs/esbabbler/calls/picture-in-picture",
    ]);
  });

  test("consecutive sections chain into one list", () => {
    expect.hasAssertions();

    const pages = getFlattenedNavigationPages([
      createItem("/docs/architecture", [createItem("/docs/architecture/auth")]),
      createItem("/docs/infra", [createItem("/docs/infra/roadmap")]),
    ]);

    expect(pages.map(({ path }) => path)).toStrictEqual([
      "/docs/architecture",
      "/docs/architecture/auth",
      "/docs/infra",
      "/docs/infra/roadmap",
    ]);
  });
});
