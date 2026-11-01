import { parseGameDataObjectPath } from "#scripts/gameData/mirror/parseGameDataObjectPath";
import { describe, expect, test } from "vitest";

describe(parseGameDataObjectPath, () => {
  const hash = "0".repeat(64);

  test("names a JSON object by the hash its last segment holds, under the dataset before it", () => {
    expect.hasAssertions();

    expect(parseGameDataObjectPath(`/index/${hash}.json`)).toStrictEqual({
      contentType: "application/json",
      hash,
      sourcePath: `index/${hash}.json`,
    });
  });

  test("names any other file by the sha256 its url carries, under its path", () => {
    expect.hasAssertions();

    expect(parseGameDataObjectPath(`/characterPacks/1/model.pmx?sha256=${hash}`)).toStrictEqual({
      contentType: "application/octet-stream",
      hash,
      sourcePath: "characterPacks/1/model.pmx",
    });
  });

  test.each([`/${hash}.json`, "/model.pmx"])("names nothing a path does not name, as %s", (path) => {
    expect.hasAssertions();

    expect(parseGameDataObjectPath(path)).toBeUndefined();
  });
});
