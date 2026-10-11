import { setManifestNodeVersion } from "#src/services/updateNode/setManifestNodeVersion";
import { describe, expect, test } from "vitest";

describe(setManifestNodeVersion, () => {
  test("rewrites engines.node to the floor", () => {
    expect.hasAssertions();

    expect(setManifestNodeVersion('  "engines": {\n    "node": ">=0.0.0"\n  }', "1.0.0")).toBe(
      '  "engines": {\n    "node": ">=1.0.0"\n  }',
    );
  });

  test("rewrites the node version of devEngines.runtime in object form", () => {
    expect.hasAssertions();

    expect(
      setManifestNodeVersion(
        '  "devEngines": {\n    "runtime": {\n      "name": "node",\n      "version": ">=0.0.0"\n    }\n  }',
        "1.0.0",
      ),
    ).toBe('  "devEngines": {\n    "runtime": {\n      "name": "node",\n      "version": ">=1.0.0"\n    }\n  }');
  });

  test("rewrites only the node entry of devEngines.runtime in array form", () => {
    expect.hasAssertions();

    expect(
      setManifestNodeVersion(
        '  "devEngines": {\n    "runtime": [\n      { "name": "npm", "version": "0.0.0" },\n      { "name": "node", "version": ">=0.0.0" }\n    ]\n  }',
        "1.0.0",
      ),
    ).toBe(
      '  "devEngines": {\n    "runtime": [\n      { "name": "npm", "version": "0.0.0" },\n      { "name": "node", "version": ">=1.0.0" }\n    ]\n  }',
    );
  });

  test("returns text with no node floor unchanged", () => {
    expect.hasAssertions();

    expect(setManifestNodeVersion('  "name": "a"', "1.0.0")).toBe('  "name": "a"');
  });
});
