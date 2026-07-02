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

  test(`defaults round-trip the ${BackendType.Auto} backend and ${Environment.None} environment`, () => {
    expect.hasAssertions();

    expect(buildVirrunConfigurationContent(BackendType.Auto, Environment.None)).toBe(
      `{\n  "$schema": "./node_modules/virrun/schema.json",\n  "backend": "auto",\n  "environment": "none"\n}\n`,
    );
  });
});
