import { getConsumerPackagePaths } from "#scripts/sweeps/sharedExportConsumers/getConsumerPackagePaths";
import { describe, expect, test } from "vitest";

describe(getConsumerPackagePaths, () => {
  const name = "takeOne";

  // The caller hands over a corpus the defining package is already out of, so nothing here has to exclude it
  test("names the package of every file referencing the export", () => {
    expect.hasAssertions();

    expect(
      getConsumerPackagePaths(name, [
        ["apps/web/app/first.ts", `${name}(items)`],
        ["packages/virrun/src/second.ts", `${name}(items)`],
      ]),
    ).toStrictEqual(["apps/web", "packages/virrun"]);
  });

  test("counts a package once however many of its files reference the export", () => {
    expect.hasAssertions();

    expect(
      getConsumerPackagePaths(name, [
        ["apps/web/app/first.ts", `${name}(items)`],
        ["apps/web/app/second.ts", `${name}(items)`],
      ]),
    ).toStrictEqual(["apps/web"]);
  });

  // The whole reason this scan exists: a scan that reports nothing reads exactly like a tree with no dead code,
  // And a boundary written as a template `\b` becomes a backspace that matches nowhere
  test("reports nothing when the export is named nowhere", () => {
    expect.hasAssertions();

    expect(getConsumerPackagePaths(name, [["apps/web/app/first.ts", "somethingElse(items)"]])).toStrictEqual([]);
  });

  test("does not count a longer name that merely contains this one", () => {
    expect.hasAssertions();

    expect(getConsumerPackagePaths(name, [["apps/web/app/first.ts", `${name}Async(items)`]])).toStrictEqual([]);
  });

  test("matches a name carrying a $, which is not a word character", () => {
    expect.hasAssertions();

    expect(getConsumerPackagePaths("$trpc", [["apps/web/app/first.ts", "$trpc.room.readRooms.query()"]])).toStrictEqual(
      ["apps/web"],
    );
  });
});
