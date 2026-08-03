import { pushRecent } from "@/services/resource/search/pushRecent";
import { describe, expect, test } from "vitest";

const checkIsSame = (a: string, b: string) => a === b;

describe(pushRecent, () => {
  const limit = 2;

  test("prepends a new entry", () => {
    expect.hasAssertions();
    expect(pushRecent([""], " ", checkIsSame, limit)).toStrictEqual([" ", ""]);
  });

  test("moves an existing entry to the front", () => {
    expect.hasAssertions();
    expect(pushRecent(["", " "], " ", checkIsSame, limit)).toStrictEqual([" ", ""]);
  });

  test("caps entries at the limit", () => {
    expect.hasAssertions();
    expect(pushRecent([" ", "a"], "", checkIsSame, limit)).toStrictEqual(["", " "]);
  });
});
