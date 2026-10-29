import { getLazyDirectories } from "#src/services/precheck/getLazyDirectories";
import { describe, expect, test } from "vitest";

describe(getLazyDirectories, () => {
  test("a directory the committed barrel lists no module of is lazy, and one it lists a module of is not", () => {
    expect.hasAssertions();

    expect(
      getLazyDirectories(
        [`export * from "./kit/Kit.ts";`, `export * from "./models/Model.ts";`, `export * from "./util/Util.ts";`],
        [`export * from "./models/Model.ts";`, `export * from "./util/Util.ts";`],
      ),
    ).toStrictEqual(["kit"]);
  });

  test("names a nested directory by its whole path, so a lazy one deeper than the first segment is found", () => {
    expect.hasAssertions();

    expect(
      getLazyDirectories(
        [`export * from "./services/character/avatar/Avatar.ts";`, `export * from "./services/Service.ts";`],
        [`export * from "./services/Service.ts";`],
      ),
    ).toStrictEqual(["services/character/avatar"]);
  });

  test("reads a top-level module as no directory", () => {
    expect.hasAssertions();

    expect(getLazyDirectories([`export * from "./Root.ts";`], [])).toStrictEqual([]);
  });
});
