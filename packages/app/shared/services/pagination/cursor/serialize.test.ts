import { serialize } from "#shared/services/pagination/cursor/serialize";
import { describe, expect, test } from "vitest";

describe(serialize, () => {
  test("serializes", () => {
    expect.hasAssertions();

    const item = { "": "" };

    expect(serialize(item, [])).toBe(Buffer.from(JSON.stringify({})).toString("base64"));
  });
});
