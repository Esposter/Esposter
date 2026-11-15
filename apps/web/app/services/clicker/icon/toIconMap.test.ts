import { toIconMap } from "#src/services/clicker/icon/toIconMap";
import { describe, expect, test } from "vitest";

describe(toIconMap, () => {
  // A srcset splits its candidates on whitespace, so an icon named after an item with a space in it would be dropped
  test("keys each icon by its item and encodes the space an item's name carries into its URL", () => {
    expect.hasAssertions();

    expect(toIconMap({ "/assets/clicker/icons/buildings/Wizard Tower.png": "/_nuxt/Wizard Tower.png" })).toStrictEqual({
      "Wizard Tower": "/_nuxt/Wizard%20Tower.png",
    });
  });
});
