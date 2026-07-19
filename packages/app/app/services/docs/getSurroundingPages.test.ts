import type { ContentNavigationItem } from "@nuxt/content";

import { getSurroundingPages } from "@/services/docs/getSurroundingPages";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const createItem = (path: string): ContentNavigationItem => ({
  path,
  title: path.split("/").at(-1) ?? "",
});

const pages = [createItem(`${RoutePath.Docs}/a`), createItem(`${RoutePath.Docs}/b`), createItem(`${RoutePath.Docs}/c`)];

describe(getSurroundingPages, () => {
  test("returns previous and next around a middle page", () => {
    expect.hasAssertions();

    expect(getSurroundingPages(pages, `${RoutePath.Docs}/b`)).toStrictEqual([
      createItem(`${RoutePath.Docs}/a`),
      createItem(`${RoutePath.Docs}/c`),
    ]);
  });

  test("first page has no previous", () => {
    expect.hasAssertions();

    expect(getSurroundingPages(pages, `${RoutePath.Docs}/a`)).toStrictEqual([
      undefined,
      createItem(`${RoutePath.Docs}/b`),
    ]);
  });

  test("last page has no next", () => {
    expect.hasAssertions();

    expect(getSurroundingPages(pages, `${RoutePath.Docs}/c`)).toStrictEqual([
      createItem(`${RoutePath.Docs}/b`),
      undefined,
    ]);
  });

  test("unknown path has no surround", () => {
    expect.hasAssertions();

    expect(getSurroundingPages(pages, `${RoutePath.Docs}/-1`)).toStrictEqual([undefined, undefined]);
  });
});
