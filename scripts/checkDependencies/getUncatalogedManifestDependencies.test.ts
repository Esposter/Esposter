import type { ManifestDependency } from "@/checkDependencies/models/ManifestDependency";

import { getUncatalogedManifestDependencies } from "@/checkDependencies/getUncatalogedManifestDependencies";
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

    const uncataloged = { ...baseDependency, specifier: "^0.0.0" };

    expect(
      getUncatalogedManifestDependencies([
        { ...baseDependency, specifier: "catalog:" },
        { ...baseDependency, specifier: "workspace:" },
        uncataloged,
      ]),
    ).toStrictEqual([uncataloged]);
  });
});
