import { getNavigationDenylist } from "#src/services/getNavigationDenylist";
import { describe, expect, test } from "vitest";

describe(getNavigationDenylist, () => {
  test("a catch-all route never denies the shell", () => {
    expect.hasAssertions();

    expect(getNavigationDenylist(["", "/", "/**"], "/")).toStrictEqual([]);
  });

  test("a prefix route denies the prefix and everything below it", () => {
    expect.hasAssertions();

    const [denylist] = getNavigationDenylist(["/api/**"], "/");

    expect(denylist?.test("/api")).toBe(true);
    expect(denylist?.test("/api/messages/1")).toBe(true);
    expect(denylist?.test("/apiary")).toBe(false);
    expect(denylist?.test("/")).toBe(false);
  });

  test("a parameter matches one segment and a single wildcard matches within one", () => {
    expect.hasAssertions();

    // The output is sorted, so the `/files/*` pattern comes before the `/users/:id` one
    const [wildcard, parameter] = getNavigationDenylist(["/users/:id", "/files/*"], "/");

    expect(wildcard?.test("/files/a")).toBe(true);
    expect(wildcard?.test("/files/a/b")).toBe(false);
    expect(parameter?.test("/users/1")).toBe(true);
    expect(parameter?.test("/users/1/posts")).toBe(false);
  });

  test("a regular expression character in a route is matched literally", () => {
    expect.hasAssertions();

    const [denylist] = getNavigationDenylist(["/robots.txt"], "/");

    expect(denylist?.test("/robots.txt")).toBe(true);
    expect(denylist?.test("/robotsxtxt")).toBe(false);
  });

  test("the base URL prefixes every route", () => {
    expect.hasAssertions();

    const [denylist] = getNavigationDenylist(["/api/**"], "/app/");

    expect(denylist?.test("/app/api/messages")).toBe(true);
    expect(denylist?.test("/api/messages")).toBe(false);
  });

  test("a repeated route is denied once, in a stable order", () => {
    expect.hasAssertions();

    expect(getNavigationDenylist(["/b", "/a", "/b"], "/").map(({ source }) => source)).toStrictEqual([
      String.raw`^\/a$`,
      String.raw`^\/b$`,
    ]);
  });
});
