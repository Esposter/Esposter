import { catalogue } from "@/services/genshin/world/catalogue";
import { describe, expect, test } from "vitest";

describe("catalogue", () => {
  test("names every region the game ships, Mondstadt first", () => {
    expect.hasAssertions();

    expect(catalogue.regions.map(({ id }) => id)).toStrictEqual([
      "mondstadt",
      "liyue",
      "inazuma",
      "sumeru",
      "fontaine",
      "natlan",
      "nod-krai",
      "snezhnaya",
    ]);
  });
});
