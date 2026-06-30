import { BackendType } from "@/models/virrun/BackendType";
import { buildVirrunConfigurationContent } from "@/services/configuration/buildVirrunConfigurationContent";
import { describe, expect, test } from "vitest";

describe(buildVirrunConfigurationContent, () => {
  test(`renders the $schema pointer and the chosen backend ${BackendType.Os}`, () => {
    expect.hasAssertions();

    expect(buildVirrunConfigurationContent(BackendType.Os)).toBe(
      `{\n  "$schema": "./node_modules/virrun/schema.json",\n  "backend": "os"\n}\n`,
    );
  });

  test(`defaults round-trip the ${BackendType.Auto} backend`, () => {
    expect.hasAssertions();

    expect(buildVirrunConfigurationContent(BackendType.Auto)).toBe(
      `{\n  "$schema": "./node_modules/virrun/schema.json",\n  "backend": "auto"\n}\n`,
    );
  });
});
