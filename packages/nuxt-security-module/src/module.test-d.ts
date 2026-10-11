import type { RouteRuleConfig } from "nitro/types";
import type { NuxtConfig } from "nuxt/schema";

import { describe, expect, expectTypeOf, test } from "vitest";

// A type-only import is enough to load the module's augmentation of `h3/rules`
import type {} from "#src/module";

describe("route rules security key", () => {
  test("a consumer's typed routeRules entry accepts the security key", () => {
    expect.hasAssertions();

    const routeRules: NuxtConfig["routeRules"] = { "/admin/**": { security: { csrf: false } } };

    expectTypeOf<RouteRuleConfig>().toHaveProperty("security");
    expect(routeRules).toStrictEqual({ "/admin/**": { security: { csrf: false } } });
  });

  test("a security key with an option the module does not have is refused", () => {
    expect.hasAssertions();

    // @ts-expect-error the module has no option named `bogus`
    const routeRules: NuxtConfig["routeRules"] = { "/admin/**": { security: { bogus: true } } };

    expect(routeRules).toStrictEqual({ "/admin/**": { security: { bogus: true } } });
  });
});
