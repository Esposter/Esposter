import { BackendType } from "@/models/virrun/BackendType";
import { Environment } from "@/models/virrun/Environment";
import { buildVirrunConfigurationContent } from "@/services/configuration/buildVirrunConfigurationContent";
import { describe, expect, test } from "vitest";

describe(buildVirrunConfigurationContent, () => {
  test(`renders the $schema pointer, the chosen backend ${BackendType.Os}, and environment ${Environment.Nuxt}`, () => {
    expect.hasAssertions();

    expect(buildVirrunConfigurationContent(BackendType.Os, Environment.Nuxt)).toBe(
      `{\n  "$schema": "./node_modules/virrun/schema.json",\n  "backend": "os",\n  "environment": "nuxt"\n}\n`,
    );
  });

  test(`omits the environment key entirely when no preset is passed, defaulting the ${BackendType.Auto} backend`, () => {
    expect.hasAssertions();

    expect(buildVirrunConfigurationContent(BackendType.Auto)).toBe(
      `{\n  "$schema": "./node_modules/virrun/schema.json",\n  "backend": "auto"\n}\n`,
    );
  });
});
