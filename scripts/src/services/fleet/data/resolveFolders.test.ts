import { DATA_FILES } from "#src/services/fleet/data/constants";
import { resolveFolders } from "#src/services/fleet/data/resolveFolders";
import { describe, expect, test } from "vitest";

describe(resolveFolders, () => {
  test("splits the comma-separated folders and takes the install's config.ini beside them", () => {
    expect.hasAssertions();

    expect(resolveFolders("extracted, text")).toStrictEqual(["extracted", "text", ...DATA_FILES]);
  });

  test("takes a config.ini named among the folders once", () => {
    expect.hasAssertions();

    expect(resolveFolders(`text,${DATA_FILES.join(",")}`)).toStrictEqual(["text", ...DATA_FILES]);
  });

  test("refuses frames and tmp, which are never copied", () => {
    expect.hasAssertions();

    expect(() => resolveFolders("text,frames")).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: fleet data, frames are never copied]`,
    );
  });
});
