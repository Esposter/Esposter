import { BackendType } from "@/models/virrun/BackendType";
import { Environment } from "@/models/virrun/Environment";
import { resolveVirrunConfiguration } from "@/services/configuration/resolveVirrunConfiguration";
import { createTemporaryDirectoryTracker } from "@/services/exec/test/createTemporaryDirectoryTracker.test";
import { VIRRUN_CONFIGURATION_FILENAME, VIRRUN_CONFIGURATION_NAME } from "@/services/exec/util/constants";
import { TEST_FILENAME } from "@/services/exec/util/constants.test";
import { InvalidOperationError } from "@esposter/shared";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, describe, expect, test } from "vitest";

describe(resolveVirrunConfiguration, () => {
  const { cleanup, create } = createTemporaryDirectoryTracker();
  const typescriptConfigurationFilename = `${VIRRUN_CONFIGURATION_NAME}.ts`;

  afterEach(() => {
    cleanup();
  });

  test("walks up from a nested cwd to the repo-root config", () => {
    expect.hasAssertions();

    const root = create();
    writeFileSync(join(root, VIRRUN_CONFIGURATION_FILENAME), JSON.stringify({ backend: BackendType.Os }));
    const nested = join(root, TEST_FILENAME, TEST_FILENAME);
    mkdirSync(nested, { recursive: true });

    expect(resolveVirrunConfiguration(nested)).toStrictEqual({ backend: BackendType.Os });
  });

  test("returns undefined when no config exists in the tree", () => {
    expect.hasAssertions();

    expect(resolveVirrunConfiguration(create())).toBeUndefined();
  });

  test("loads a TS config's default export from a nested cwd", () => {
    expect.hasAssertions();

    const root = create();
    writeFileSync(
      join(root, typescriptConfigurationFilename),
      `export default { backend: "${BackendType.Native}", environment: "${Environment.Nuxt}" };`,
    );
    const nested = join(root, TEST_FILENAME, TEST_FILENAME);
    mkdirSync(nested, { recursive: true });

    expect(resolveVirrunConfiguration(nested)).toStrictEqual({
      backend: BackendType.Native,
      environment: Environment.Nuxt,
    });
  });

  test("evaluates process.platform branching in a TS config", () => {
    expect.hasAssertions();

    const root = create();
    writeFileSync(
      join(root, typescriptConfigurationFilename),
      `export default { backend: process.platform === "${process.platform}" ? "${BackendType.Native}" : "${BackendType.Os}" };`,
    );

    expect(resolveVirrunConfiguration(root)).toStrictEqual({ backend: BackendType.Native });
  });

  test("prefers the TS config over the JSON variant in the same directory", () => {
    expect.hasAssertions();

    const root = create();
    writeFileSync(join(root, typescriptConfigurationFilename), `export default { backend: "${BackendType.Native}" };`);
    writeFileSync(join(root, VIRRUN_CONFIGURATION_FILENAME), JSON.stringify({ backend: BackendType.Os }));

    expect(resolveVirrunConfiguration(root)).toStrictEqual({ backend: BackendType.Native });
  });

  test("prefers a nearer JSON variant over an ancestor TS config — nearest directory wins", () => {
    expect.hasAssertions();

    const root = create();
    writeFileSync(join(root, typescriptConfigurationFilename), `export default { backend: "${BackendType.Native}" };`);
    const nested = join(root, TEST_FILENAME);
    mkdirSync(nested);
    writeFileSync(join(nested, VIRRUN_CONFIGURATION_FILENAME), JSON.stringify({ backend: BackendType.Os }));

    expect(resolveVirrunConfiguration(nested)).toStrictEqual({ backend: BackendType.Os });
  });

  test("strips the JSON variant's $schema pointer", () => {
    expect.hasAssertions();

    const root = create();
    writeFileSync(
      join(root, VIRRUN_CONFIGURATION_FILENAME),
      JSON.stringify({ $schema: "./schema.json", backend: BackendType.Os }),
    );

    expect(resolveVirrunConfiguration(root)).toStrictEqual({ backend: BackendType.Os });
  });

  test("throws on a TS config with a syntax error — a broken config fails loud, never a silent backend change", () => {
    expect.hasAssertions();

    const root = create();
    writeFileSync(join(root, typescriptConfigurationFilename), "export default {");

    expect(() => resolveVirrunConfiguration(root)).toThrow(InvalidOperationError);
  });

  test("throws on a TS config with an unknown key", () => {
    expect.hasAssertions();

    const root = create();
    writeFileSync(join(root, typescriptConfigurationFilename), `export default { "": "" };`);

    expect(() => resolveVirrunConfiguration(root)).toThrow(InvalidOperationError);
  });
});
