import type { VirrunConfigurationInput } from "@/models/virrun/VirrunConfigurationInput";

import { BackendType } from "@/models/virrun/BackendType";
import { Environment } from "@/models/virrun/Environment";
import { defineConfig } from "@/services/configuration/defineConfig";
import { describe, expect, test } from "vitest";

describe(defineConfig, () => {
  test("returns the same configuration reference — a typed identity", () => {
    expect.hasAssertions();

    const configuration: VirrunConfigurationInput = { backend: BackendType.Native, environment: Environment.Nuxt };

    expect(defineConfig(configuration)).toBe(configuration);
  });

  test("accepts raw enum string values, so a config file needs no enum value imports", () => {
    expect.hasAssertions();

    expect(defineConfig({ backend: "native", environment: "nuxt" })).toStrictEqual({
      backend: BackendType.Native,
      environment: Environment.Nuxt,
    });
  });
});
