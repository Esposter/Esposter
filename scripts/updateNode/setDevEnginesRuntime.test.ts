import { setDevEnginesRuntime } from "#scripts/updateNode/setDevEnginesRuntime";
import { describe, expect, test } from "vitest";

describe(setDevEnginesRuntime, () => {
  test("rewrites devEngines.runtime.version to the carated version", () => {
    expect.hasAssertions();

    expect(
      setDevEnginesRuntime('{ "devEngines": { "runtime": { "name": "node", "version": "^0.0.0" } } }', "1.0.0"),
    ).toBe('{ "devEngines": { "runtime": { "name": "node", "version": "^1.0.0" } } }');
  });

  test("preserves surrounding formatting", () => {
    expect.hasAssertions();

    expect(
      setDevEnginesRuntime(
        '{\n  "devEngines": {\n    "runtime": {\n      "name": "node",\n      "version": "^0.0.0"\n    }\n  }\n}',
        "1.0.0",
      ),
    ).toBe('{\n  "devEngines": {\n    "runtime": {\n      "name": "node",\n      "version": "^1.0.0"\n    }\n  }\n}');
  });

  test("leaves engines.node untouched", () => {
    expect.hasAssertions();

    expect(
      setDevEnginesRuntime(
        '{ "devEngines": { "runtime": { "version": "^0.0.0" } }, "engines": { "node": "^0.0.0" } }',
        "1.0.0",
      ),
    ).toBe('{ "devEngines": { "runtime": { "version": "^1.0.0" } }, "engines": { "node": "^0.0.0" } }');
  });

  test("throws when devEngines.runtime.version is absent", () => {
    expect.hasAssertions();

    expect(() => setDevEnginesRuntime("{}", "1.0.0")).toThrowErrorMatchingInlineSnapshot(
      `[Error: Could not find devEngines.runtime.version in package.json]`,
    );
  });
});
