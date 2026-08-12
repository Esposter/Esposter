import { createNavigationItem } from "@/services/docs/createNavigationItem.test";
import { getSurroundingPages } from "@/services/docs/getSurroundingPages";
import { RoutePath } from "@esposter/shared";
import { describe, expect, test } from "vitest";

const pages = [
  createNavigationItem(`${RoutePath.Docs}/a`),
  createNavigationItem(`${RoutePath.Docs}/b`),
  createNavigationItem(`${RoutePath.Docs}/c`),
];

describe(getSurroundingPages, () => {
  test("returns previous and next around a middle page", () => {
    expect.hasAssertions();

    expect(getSurroundingPages(pages, `${RoutePath.Docs}/b`)).toStrictEqual([
      createNavigationItem(`${RoutePath.Docs}/a`),
      createNavigationItem(`${RoutePath.Docs}/c`),
    ]);
  });

  test("first page has no previous", () => {
    expect.hasAssertions();

    expect(getSurroundingPages(pages, `${RoutePath.Docs}/a`)).toStrictEqual([
      undefined,
      createNavigationItem(`${RoutePath.Docs}/b`),
    ]);
  });

  test("last page has no next", () => {
    expect.hasAssertions();

    expect(getSurroundingPages(pages, `${RoutePath.Docs}/c`)).toStrictEqual([
      createNavigationItem(`${RoutePath.Docs}/b`),
      undefined,
    ]);
  });

  test("unknown path has no surround", () => {
    expect.hasAssertions();

    expect(getSurroundingPages(pages, `${RoutePath.Docs}/-1`)).toStrictEqual([undefined, undefined]);
  });
});
