import { readDatedProse } from "#src/services/openspec/readDatedProse";
import { describe, expect, test } from "vitest";

describe(readDatedProse, () => {
  test("no Markdown doc in the repository states a date outside a URL, the archive, the ledgers, the vendored skills or a changelog", () => {
    expect.hasAssertions();

    expect(readDatedProse()).toStrictEqual([]);
  });
});
