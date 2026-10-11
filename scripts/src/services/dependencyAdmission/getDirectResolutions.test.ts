import { getDirectResolutions } from "#src/services/dependencyAdmission/getDirectResolutions";
import { describe, expect, test } from "vitest";

describe(getDirectResolutions, () => {
  test("maps a catalog importer to its name at the resolved version, dropping peer suffixes", () => {
    expect.hasAssertions();

    expect(
      getDirectResolutions(
        "importers:\n\n  .:\n    devDependencies:\n      a:\n        specifier: 'catalog:'\n        version: 1.0.0(b)\n",
      ),
    ).toStrictEqual(new Map([["a", "a@1.0.0"]]));
  });

  test("keys an alias by the version, which already names its package, and skips non-catalog specifiers", () => {
    expect.hasAssertions();

    expect(
      getDirectResolutions(
        "importers:\n\n  .:\n    dependencies:\n      '@nuxt/kit':\n        specifier: 'catalog:'\n        version: '@nuxt/kit-nightly@5.0.0(x)'\n      b:\n        specifier: ^1.0.0\n        version: 1.0.0\n",
      ),
    ).toStrictEqual(new Map([["@nuxt/kit", "@nuxt/kit-nightly@5.0.0"]]));
  });
});
