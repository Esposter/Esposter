import { getImporterVersions } from "#src/services/outdatedDependencies/lock/getImporterVersions";
import { describe, expect, test } from "vitest";

describe(getImporterVersions, () => {
  test("reads the importers of a lockfile that is one document with no separator", () => {
    expect.hasAssertions();

    const lockYaml = [
      "lockfileVersion: '9.0'",
      "",
      "importers:",
      "",
      "  .:",
      "    dependencies:",
      "      foo:",
      "        specifier: ^1.0.0",
      "        version: 1.2.3",
      "",
    ].join("\n");

    expect(getImporterVersions(lockYaml, ".")).toStrictEqual(new Map([["foo", "1.2.3"]]));
  });
});
