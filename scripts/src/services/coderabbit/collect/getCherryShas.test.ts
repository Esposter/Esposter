import { getCherryShas } from "#src/services/coderabbit/collect/getCherryShas";
import { describe, expect, test } from "vitest";

describe(getCherryShas, () => {
  const ported = "a".repeat(40);
  const owed = "b".repeat(40);

  test("keeps the commits not yet upstream, in order", () => {
    expect.hasAssertions();

    expect(getCherryShas(`- ${ported}\n+ ${owed}\n`)).toStrictEqual([owed]);
  });

  test("reads an empty output as nothing owed", () => {
    expect.hasAssertions();

    expect(getCherryShas("")).toStrictEqual([]);
  });
});
