import type { ContentNavigationItem } from "@nuxt/content";

import { getSurroundingPages } from "@/services/docs/getSurroundingPages";
import { describe, expect, test } from "vitest";

const createItem = (path: string): ContentNavigationItem => ({
  path,
  title: path.split("/").at(-1) ?? "",
});

const pages = [createItem("/docs/posts"), createItem("/docs/posts/likes"), createItem("/docs/posts/roadmap")];

describe(getSurroundingPages, () => {
  test("returns previous and next around a middle page", () => {
    expect.hasAssertions();

    expect(getSurroundingPages(pages, "/docs/posts/likes")).toStrictEqual([
      createItem("/docs/posts"),
      createItem("/docs/posts/roadmap"),
    ]);
  });

  test("first page has no previous", () => {
    expect.hasAssertions();

    expect(getSurroundingPages(pages, "/docs/posts")).toStrictEqual([null, createItem("/docs/posts/likes")]);
  });

  test("last page has no next", () => {
    expect.hasAssertions();

    expect(getSurroundingPages(pages, "/docs/posts/roadmap")).toStrictEqual([createItem("/docs/posts/likes"), null]);
  });

  test("unknown path has no surround", () => {
    expect.hasAssertions();

    expect(getSurroundingPages(pages, "/docs/unknown")).toStrictEqual([null, null]);
  });
});
