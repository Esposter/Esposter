import type { ManifestDependency } from "#scripts/outdatedDependencies/models/ManifestDependency";

import { getUncatalogedManifestDependencies } from "#scripts/outdatedDependencies/getUncatalogedManifestDependencies";
import { describe, expect, test } from "vitest";

describe(getUncatalogedManifestDependencies, () => {
  const baseDependency: ManifestDependency = {
    field: "dependencies",
    manifestName: "",
    manifestPath: "",
    pkg: "",
    specifier: "",
  };

  test("keeps dependencies that are not catalog or workspace references", () => {
    expect.hasAssertions();

    const uncatalogedDependency = { ...baseDependency, specifier: "^0.0.0" };

    expect(
      getUncatalogedManifestDependencies([
        { ...baseDependency, specifier: "catalog:" },
        { ...baseDependency, specifier: "workspace:" },
        uncatalogedDependency,
      ]),
    ).toStrictEqual([uncatalogedDependency]);
  });
});
