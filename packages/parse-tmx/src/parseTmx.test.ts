import { TMXParsed } from "@/models/tmx/parsed/TMXParsed";
import { parseTmx } from "@/parseTmx";
import { describe, expect, test } from "vitest";

describe(parseTmx, () => {
  test("empty", async () => {
    expect.hasAssertions();

    const tmxParsed = await parseTmx("<map><data/></map>");

    expect(tmxParsed).toStrictEqual(new TMXParsed());
  });
});
