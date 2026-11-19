import { toIconMap } from "#src/services/clicker/icon/toIconMap";
import { describe, expect, test } from "vitest";

describe(toIconMap, () => {
  test.each(["/_nuxt/Wizard Tower.png", "/_nuxt/Wizard%20Tower.png"])(
    "keys each icon by its item and encodes its space once whether the URL arrives raw or encoded (%s)",
    (source) => {
      expect.hasAssertions();

      expect(toIconMap({ "/assets/clicker/icons/buildings/Wizard Tower.png": source })).toStrictEqual({
        "Wizard Tower": "/_nuxt/Wizard%20Tower.png",
      });
    },
  );
});
