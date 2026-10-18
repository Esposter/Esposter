import { getOpenSpecOwners } from "#src/services/openspec/getOpenSpecOwners";
import { describe, expect, test } from "vitest";

describe(getOpenSpecOwners, () => {
  test("gives a capability's pages its folder", () => {
    expect.hasAssertions();

    expect(getOpenSpecOwners("openspec/specs/a/b/design.md")).toStrictEqual(["openspec/specs/a/b"]);
  });

  test("gives a change's pages the change, and a delta the capability it modifies as well", () => {
    expect.hasAssertions();

    expect(getOpenSpecOwners("openspec/changes/a-c/tasks.md")).toStrictEqual(["openspec/changes/a-c"]);
    expect(getOpenSpecOwners("openspec/changes/a-c/specs/a/b/spec.md")).toStrictEqual([
      "openspec/changes/a-c",
      "openspec/specs/a/b",
    ]);
  });

  test("gives an archived change's pages the archived change, not the archive folder they share", () => {
    expect.hasAssertions();

    expect(getOpenSpecOwners("openspec/changes/archive/a-c/design.md")).toStrictEqual(["openspec/changes/archive/a-c"]);
    expect(getOpenSpecOwners("openspec/changes/archive/a-c/specs/a/b/spec.md")).toStrictEqual([
      "openspec/changes/archive/a-c",
      "openspec/specs/a/b",
    ]);
  });

  test("gives a path outside the tree none", () => {
    expect.hasAssertions();

    expect(getOpenSpecOwners(".agents/skills/a/SKILL.md")).toStrictEqual([]);
  });
});
