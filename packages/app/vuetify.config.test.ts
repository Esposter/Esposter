import { describe, expect, test } from "vitest";
import { defineVuetifyConfiguration } from "vuetify-nuxt-module/custom-configuration";

import vuetifyConfig from "./vuetify.config";

describe(defineVuetifyConfiguration, () => {
  test("theme and variations", () => {
    expect.hasAssertions();

    expect(vuetifyConfig.theme).toMatchInlineSnapshot();
  });
});
