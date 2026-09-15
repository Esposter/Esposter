import { getStaleNames } from "#src/services/sweeps/staleNames/getStaleNames";
import { describe, expect, test } from "vitest";

describe(getStaleNames, () => {
  const path = "";
  const sourceNames = new Set(["a", "aB", "b"]);

  // The whole reason this scan exists: a scan that reports nothing reads exactly like a current tree, so the
  // First thing it owes is a planted violation it does report
  test("reports a code name the source no longer holds", () => {
    expect.hasAssertions();

    expect(getStaleNames([{ path, text: "`aC`" }], sourceNames)).toStrictEqual([{ name: "aC", path }]);
  });

  test("reports a name once per page", () => {
    expect.hasAssertions();

    expect(getStaleNames([{ path, text: "`aC` `aC`" }], sourceNames)).toStrictEqual([{ name: "aC", path }]);
  });

  // A placeholder word inside a longer word is not a placeholder: substring matching suppressed every real name
  // Spelling one — and a stale name that reads as English is the one nobody notices
  test.each(["readBare", "readFooter"])("reports %s, whose word merely spells a placeholder", (name) => {
    expect.hasAssertions();

    expect(getStaleNames([{ path, text: `\`${name}\`` }], sourceNames)).toStrictEqual([{ name, path }]);
  });

  test("reports the callee of a cited call", () => {
    expect.hasAssertions();

    expect(getStaleNames([{ path, text: "`aC(a)`" }], sourceNames)).toStrictEqual([{ name: "aC", path }]);
  });

  test("reports every bound name of a cited destructure", () => {
    expect.hasAssertions();

    expect(getStaleNames([{ path, text: "`{ aB, aC, aD }`" }], sourceNames)).toStrictEqual([
      { name: "aC", path },
      { name: "aD", path },
    ]);
  });

  test.each([
    ["a name the source holds", "`aB`"],
    ["a member access whose every segment the source holds", "`a.b`"],
    ["a lone capitalised word", "`Ab`"],
    ["a lowercase word", "`a`"],
    ["a placeholder", "`aFoo`"],
    ["a placeholder an acronym runs into", "`aHTMLFoo`"],
    ["a pluralised placeholder", "`aFoos`"],
    ["a SCREAMING_SNAKE placeholder", "`FOO_A`"],
    ["a lone X standing in for a segment", "`aX`"],
    ["a path", "`a/b`"],
  ])("reports nothing for %s", (_, text) => {
    expect.hasAssertions();

    expect(getStaleNames([{ path, text }], sourceNames)).toStrictEqual([]);
  });

  test.each(["rejected", "deferred", "proposals"])("reports nothing on a page under %s", (folder) => {
    expect.hasAssertions();

    expect(getStaleNames([{ path: `/${folder}/`, text: "`aC`" }], sourceNames)).toStrictEqual([]);
  });
});
